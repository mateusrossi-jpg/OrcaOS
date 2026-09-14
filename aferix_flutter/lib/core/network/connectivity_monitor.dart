import 'package:connectivity_plus/connectivity_plus.dart';

/// Abstração do monitor de conectividade.
///
/// Permite testar o [ConnectivityService] sem depender do canal de
/// plataforma do `connectivity_plus` (indisponível em testes de unidade).
abstract class ConnectivityMonitor {
  Stream<bool> get onOnlineChanged;
  Future<bool> isOnline();
}

/// Implementação real usando `connectivity_plus`.
class ConnectivityPlusMonitor implements ConnectivityMonitor {
  final Connectivity _connectivity;

  ConnectivityPlusMonitor({Connectivity? connectivity})
      : _connectivity = connectivity ?? Connectivity();

  @override
  Stream<bool> get onOnlineChanged async* {
    yield await isOnline();
    yield* _connectivity.onConnectivityChanged.map(_hasInternet);
  }

  @override
  Future<bool> isOnline() async {
    final results = await _connectivity.checkConnectivity();
    return _hasInternet(results);
  }

  bool _hasInternet(List<ConnectivityResult> results) {
    return results.any((r) => r != ConnectivityResult.none);
  }
}