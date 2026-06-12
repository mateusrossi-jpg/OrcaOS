import 'package:aferix_flutter/domain/models/home_data.dart';

/// Abstract repository for fetching Home screen data.
/// Implementations should provide the concrete data source (e.g., API,
/// local cache, or mock). This interface resides in the domain layer to
/// keep the business logic independent of infrastructure concerns.
abstract class HomeRepository {
  /// Retrieves the [HomeData] required by the Home feature.
  /// Returns a [Future] that completes with the populated [HomeData]
  /// instance. Implementations may throw exceptions which should be
  /// handled by the calling use‑case or presentation layer.
  Future<HomeData> fetchHomeData();
}
