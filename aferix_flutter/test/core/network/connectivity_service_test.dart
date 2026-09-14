import 'package:aferix_flutter/core/network/connectivity_service.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/fake_connectivity_monitor.dart';

void main() {
  late FakeConnectivityMonitor monitor;
  late ConnectivityService service;

  setUp(() {
    monitor = FakeConnectivityMonitor(startOnline: false);
    service = ConnectivityService(monitor);
  });

  tearDown(() {
    service.dispose();
  });

  test('start → estado inicial offline', () async {
    await service.start();
    expect(service.isOnline, isFalse);
  });

  test('emitir online → stream notifica e estado atualiza', () async {
    final events = <bool>[];
    service.onOnlineChanged.listen(events.add);

    await service.start();
    expect(events, isEmpty); // sem mudança até transição

    monitor.emitOnline();
    await Future<void>.delayed(const Duration(milliseconds: 5));

    expect(service.isOnline, isTrue);
    expect(events, [true]);
  });

  test('refresh re-sincroniza estado sem evento duplicado', () async {
    final events = <bool>[];
    service.onOnlineChanged.listen(events.add);

    await service.start();
    monitor.setOnline(true);
    await Future<void>.delayed(const Duration(milliseconds: 5));
    expect(service.isOnline, isTrue);

    await service.refresh();
    await Future<void>.delayed(const Duration(milliseconds: 5));
    expect(service.isOnline, isTrue);
    expect(events, [true, true]); // refresh emite o estado atual
  });

  test('queda de conexão notifica offline', () async {
    final events = <bool>[];
    service.onOnlineChanged.listen(events.add);

    await service.start();
    monitor.setOnline(true);
    monitor.setOnline(false);
    await Future<void>.delayed(const Duration(milliseconds: 5));

    expect(service.isOnline, isFalse);
    expect(events, [true, false]);
  });
}