import 'package:equatable/equatable.dart';
import 'package:aferix_flutter/domain/models/home_data.dart';

enum HomeStatus { initial, loading, success, error }

class HomeState extends Equatable {
  final HomeStatus status;
  final HomeData? data;
  final String? errorMessage;

  const HomeState({
    required this.status,
    this.data,
    this.errorMessage,
  });

  HomeState copyWith({
    HomeStatus? status,
    HomeData? data,
    String? errorMessage,
  }) => HomeState(
        status: status ?? this.status,
        data: data ?? this.data,
        errorMessage: errorMessage ?? this.errorMessage,
      );

  @override
  List<Object?> get props => [status, data, errorMessage];
}
