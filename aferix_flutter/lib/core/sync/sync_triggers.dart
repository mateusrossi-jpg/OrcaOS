import 'dart:async';

import 'package:flutter/widgets.dart';

import '../network/connectivity_service.dart';

import 'sync_engine.dart';

/// Gatilhos de sync equivalentes ao React (seção 1.7 / 3.7).
///
/// - `AppLifecycleListener.onResume` — voltou do background;
/// - `onConnectivityChanged` — voltou a ter internet;
/// - `Timer.periodic` — 30s (principal) e 5min (redundância).
class SyncTriggers {
  SyncTriggers({
    required this.engine,
    required this.connectivity,
    required void Function(String) onError,
    this.period = const Duration(seconds: 30),
    this.redundantPeriod = const Duration(minutes: 5),
  }) : _onError = onError;

  final SyncEngine engine;
  final ConnectivityService connectivity;
  final void Function(String) _onError;
  final Duration period;
  final Duration redundantPeriod;

  AppLifecycleListener? _lifecycle;
  StreamSubscription<bool>? _connectivitySub;
  Timer? _timer;
  Timer? _redundantTimer;

  bool _started = false;

  Future<void> start() async {
    if (_started) return;
    _started = true;

    _lifecycle = AppLifecycleListener(
      onResume: () => _safeTrigger(),
    );

    await connectivity.start();
    _connectivitySub = connectivity.onOnlineChanged.listen((online) {
      if (online) _safeTrigger();
    });

    _timer = Timer.periodic(period, (_) => _safeTrigger());
    _redundantTimer = Timer.periodic(redundantPeriod, (_) => _safeTrigger());
  }

  Future<void> _safeTrigger() async {
    try {
      await engine.triggerSync();
    } catch (e) {
      _onError(e.toString());
    }
  }

  void dispose() {
    _lifecycle?.dispose();
    _connectivitySub?.cancel();
    _timer?.cancel();
    _redundantTimer?.cancel();
    connectivity.dispose();
    _started = false;
  }
}