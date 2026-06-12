import 'package:aferix_flutter/domain/models/home_data.dart';
import 'package:aferix_flutter/domain/repositories/home_repository.dart';

class GetHomeData {
  final HomeRepository repository;

  GetHomeData(this.repository);

  Future<HomeData> call() {
    return repository.fetchHomeData();
  }
}
