import 'package:aferix_flutter/domain/models/home_data.dart';
import 'package:aferix_flutter/domain/repositories/home_repository.dart';

class FakeSuccessRepository implements HomeRepository {
  @override
  Future<HomeData> fetchHomeData() async {
    return HomeData(
      alerts: const [],
      activities: const [],
      agenda: const [],
      kpis: const [],
      quickActions: const [],
    );
  }
}
