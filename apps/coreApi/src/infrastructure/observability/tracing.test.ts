import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupTestEnv } from '../../__tests__/helpers';

setupTestEnv();

const telemetryMocks = vi.hoisted(() => {
  const setLogger = vi.fn();
  const autoInstrumentationFactory = vi.fn(() => ['auto-instrumentations']);
  const exporterCtor = vi.fn(function exporterConstructor(config: unknown) {
    return { config };
  });
  const prometheusCtor = vi.fn(function prometheusConstructor(config: unknown) {
    return { config };
  });
  const sdkStart = vi.fn().mockResolvedValue(undefined);
  const sdkShutdown = vi.fn().mockResolvedValue(undefined);
  const nodeSdkCtor = vi.fn(function nodeSdkConstructor() {
    return {
      shutdown: sdkShutdown,
      start: sdkStart,
    };
  });

  return {
    autoInstrumentationFactory,
    exporterCtor,
    nodeSdkCtor,
    prometheusCtor,
    sdkShutdown,
    sdkStart,
    setLogger,
  };
});

vi.mock('@opentelemetry/api', () => ({
  DiagConsoleLogger: vi.fn(),
  DiagLogLevel: {
    ERROR: 'error',
  },
  diag: {
    setLogger: telemetryMocks.setLogger,
  },
}));

vi.mock('@opentelemetry/auto-instrumentations-node', () => ({
  getNodeAutoInstrumentations: telemetryMocks.autoInstrumentationFactory,
}));

vi.mock('@opentelemetry/exporter-trace-otlp-http', () => ({
  OTLPTraceExporter: telemetryMocks.exporterCtor,
}));

vi.mock('@opentelemetry/exporter-prometheus', () => ({
  PrometheusExporter: telemetryMocks.prometheusCtor,
}));

vi.mock('@opentelemetry/sdk-node', () => ({
  NodeSDK: telemetryMocks.nodeSdkCtor,
}));

import { runtimeConfig } from '../../app/runtimeConfig';
import { startTelemetry, stopTelemetry } from './telemetry';

describe('telemetry', () => {
  const originalTelemetryConfig = {
    enabled: runtimeConfig.telemetry.enabled,
    metricsPort: runtimeConfig.telemetry.metricsPort,
    otlpEndpoint: runtimeConfig.telemetry.otlpEndpoint,
    serviceName: runtimeConfig.telemetry.serviceName,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    runtimeConfig.telemetry.enabled = false;
    runtimeConfig.telemetry.metricsPort = 9464;
    runtimeConfig.telemetry.otlpEndpoint = null;
    runtimeConfig.telemetry.serviceName = 'coreApi-test';
    delete process.env.OTEL_SERVICE_NAME;
  });

  afterEach(async () => {
    await stopTelemetry();
    runtimeConfig.telemetry.enabled = originalTelemetryConfig.enabled;
    runtimeConfig.telemetry.metricsPort = originalTelemetryConfig.metricsPort;
    runtimeConfig.telemetry.otlpEndpoint = originalTelemetryConfig.otlpEndpoint;
    runtimeConfig.telemetry.serviceName = originalTelemetryConfig.serviceName;
  });

  it('does not initialize the SDK when telemetry is disabled', async () => {
    await startTelemetry();

    expect(telemetryMocks.nodeSdkCtor).not.toHaveBeenCalled();
    expect(telemetryMocks.prometheusCtor).not.toHaveBeenCalled();
  });

  it('starts telemetry with prometheus and otlp exporters when enabled', async () => {
    runtimeConfig.telemetry.enabled = true;
    runtimeConfig.telemetry.metricsPort = 9100;
    runtimeConfig.telemetry.otlpEndpoint = 'http://otel:4318/';
    runtimeConfig.telemetry.serviceName = 'coreApi-observability';

    await startTelemetry();

    expect(process.env.OTEL_SERVICE_NAME).toBe('coreApi-observability');
    expect(telemetryMocks.setLogger).toHaveBeenCalledWith(expect.anything(), 'error');
    expect(telemetryMocks.prometheusCtor).toHaveBeenCalledWith({
      endpoint: '/metrics',
      port: 9100,
    });
    expect(telemetryMocks.exporterCtor).toHaveBeenCalledWith({
      url: 'http://otel:4318/v1/traces',
    });
    expect(telemetryMocks.nodeSdkCtor).toHaveBeenCalledWith({
      instrumentations: [['auto-instrumentations']],
      metricReader: { config: { endpoint: '/metrics', port: 9100 } },
      traceExporter: { config: { url: 'http://otel:4318/v1/traces' } },
    });
    expect(telemetryMocks.sdkStart).toHaveBeenCalledWith();
  });

  it('shuts down the initialized SDK', async () => {
    runtimeConfig.telemetry.enabled = true;

    await startTelemetry();
    await stopTelemetry();

    expect(telemetryMocks.sdkShutdown).toHaveBeenCalledWith();
  });
});
