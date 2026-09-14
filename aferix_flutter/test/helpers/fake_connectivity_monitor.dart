import 'dart:async';

import 'package:aferix_flutter/core/network/connectivity_monitor.dart';

/// Monitor fake — não depende do canal de plataforma do connectivity_plus.
class FakeConnectivityMonitor implements ConnectivityMonitor {
  FakeConnectivityMonitor({bool startOnline = false}) : _online = startOnline;

  final _controller = StreamController<bool>.broadcast();

  bool _online;

  @override
  Stream<bool> get onOnlineChanged => _controller.stream;

  @override
  Future<bool> isOnline() async => _online;

  void setOnline(bool online) {
    _online = online;
    _controller.add(online);
  }

  void emitOnline() => setOnline(true);

  void dispose() => _controller.close();
}