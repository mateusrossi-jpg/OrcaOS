import 'package:test/test.dart';
import 'package:aferix_flutter/domain/repositories/home_repository.dart';
import 'package:aferix_flutter/domain/usecases/get_home_data.dart';
import 'package:aferix_flutter/features/home/presentation/controllers/home_controller.dart';
import 'fake_success_repository.dart';
import 'fake_error_repository.dart';
import 'package:aferix_flutter/domain/models/home_data.dart';

void main() {
  group('HomeController', () {
    test('load success transitions to success with data', () async {
      final controller = HomeController(GetHomeData(FakeSuccessRepository()));
      expect(controller.state.status, HomeStatus.initial);
      await controller.load();
      expect(controller.state.status, HomeStatus.success);
      expect(controller.state.data, isA<HomeData>());
      expect(controller.state.errorMessage, isNull);
    });

    test('load error transitions to error, clears data', () async {
      final controller = HomeController(GetHomeData(FakeErrorRepository()));
      // preload with success data to ensure it gets cleared on error
      controller.load(); // ignore first call to set loading; we will force error
      await controller.load();
      expect(controller.state.status, HomeStatus.error);
      expect(controller.state.data, isNull);
      expect(controller.state.errorMessage, isNotNull);
    });

    test('reentrancy: multiple load calls only one fetch', () async {
      int fetchCount = 0;
      final repo = _CountingRepository(() => fetchCount++);
      final controller = HomeController(GetHomeData(repo));
      // invoke load twice quickly
      await controller.load();
      controller.load();
      // wait for async work to finish
      await Future.delayed(Duration(milliseconds: 10));
      expect(fetchCount, 1);
      expect(controller.state.status, HomeStatus.success);
    });
  });
}

class _CountingRepository implements HomeRepository {
  final void Function() onFetch;
  _CountingRepository(this.onFetch);

  @override
  Future<HomeData> fetchHomeData() async {
    onFetch();
    return HomeData(
      alerts: const [],
      activities: const [],
      agenda: const [],
      kpis: const [],
      quickActions: const [],
    );
  }
}
