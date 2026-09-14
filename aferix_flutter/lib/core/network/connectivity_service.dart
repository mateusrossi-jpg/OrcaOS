import 'dart:async';

import 'connectivity_monitor.dart';

/// Estado de conectividade observável, com valor atual e stream de eventos.
///
/// O [SyncEngine] assina [onOnlineChanged] para disparar `triggerSync`
/// quando o dispositivo voltar a ficar online (seção 3.7).
class ConnectivityService {
  final ConnectivityMonitor _monitor;
  bool _online = false;
  final _controller = StreamController<bool>.broadcast();
  StreamSubscription<bool>? _subscription;

  ConnectivityService(this._monitor);

  bool get isOnline => _online;

  /// Stream de mudanças de conectividade (`true` = voltou online).
  Stream<bool> get onOnlineChanged => _controller.stream;

  Future<void> start() async {
    if (_subscription != null) return;
    _online = await _monitor.isOnline();
    _subscription = _monitor.onOnlineChanged.listen((online) {
      final changed = online != _online;
      _online = online;
      if (changed) {
        _controller.add(online);
      }
    });
  }

  Future<void> stop() async {
    await _subscription?.cancel();
    _subscription = null;
    await _controller.close();
  }

  /// Re-consulta o estado atual (útil no lifecycle resume).
  Future<void> refresh() async {
    final online = await _monitor.isOnline();
    _online = online;
    _controller.add(online);
  }

  void dispose() {
    _subscription?.cancel();
    _controller.close();
  }
}