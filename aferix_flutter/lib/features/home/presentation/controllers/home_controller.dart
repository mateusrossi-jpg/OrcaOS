import 'package:flutter/foundation.dart';
import 'package:aferix_flutter/domain/models/home_data.dart';
import 'package:aferix_flutter/domain/usecases/get_home_data.dart';
import '../states/home_state.dart';
export '../states/home_state.dart';

class HomeController extends ChangeNotifier {
  final GetHomeData getHomeData;
  bool _isLoading = false;

  HomeState _state = const HomeState(status: HomeStatus.initial);

  HomeController(this.getHomeData);

  HomeState get state => _state;

  /// Loads the home data from the repository.
  /// The state is updated synchronously to reflect the loading, success,
  /// or error status. All updates are performed by creating a new
  /// immutable [HomeState] via the `copyWith` method.
  Future<void> load() async {
    if (_state.status == HomeStatus.success) return;
    if (_isLoading) return;
    _isLoading = true;
    _state = _state.copyWith(status: HomeStatus.loading);
notifyListeners();



    try {
      final HomeData data = await getHomeData.call();
      // Success – update state with data
      _state = _state.copyWith(
        status: HomeStatus.success,
        data: data,
        errorMessage: null,
      );
notifyListeners();
    } catch (e) {
      // Error – capture the message
      _state = _state.copyWith(
        status: HomeStatus.error,
        data: null,
        errorMessage: e.toString(),
      );
    } finally {
      _isLoading = false;
    }
  }
}
