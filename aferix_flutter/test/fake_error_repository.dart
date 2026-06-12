import 'package:aferix_flutter/domain/models/home_data.dart';
import 'package:aferix_flutter/domain/repositories/home_repository.dart';

class FakeErrorRepository implements HomeRepository {
  @override
  Future<HomeData> fetchHomeData() async {
    throw Exception('fail');
  }
}
