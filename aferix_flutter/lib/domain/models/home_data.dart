import 'package:equatable/equatable.dart';
import 'alert_data.dart';
import 'activity_data.dart';
import 'agenda_data.dart';
import 'kpi_data.dart';
import 'quick_action_data.dart';

/// Data transfer object representing all data needed for the Home screen.
/// Aggregates the different sections of the home screen.
class HomeData extends Equatable {
  final List<AlertData> alerts;
  final List<ActivityData> activities;
  final List<AgendaData> agenda;
  final List<KpiData> kpis;
  final List<QuickActionData> quickActions;

  HomeData({
    required this.alerts,
    required this.activities,
    required this.agenda,
    required this.kpis,
    required this.quickActions,
  });

  @override
  List<Object?> get props => [alerts, activities, agenda, kpis, quickActions];

  factory HomeData.fromJson(Map<String, dynamic> json) => HomeData(
        alerts: (json['alerts'] as List<dynamic>)
            .map((e) => AlertData.fromJson(e as Map<String, dynamic>))
            .toList(),
        activities: (json['activities'] as List<dynamic>)
            .map((e) => ActivityData.fromJson(e as Map<String, dynamic>))
            .toList(),
        agenda: (json['agenda'] as List<dynamic>)
            .map((e) => AgendaData.fromJson(e as Map<String, dynamic>))
            .toList(),
        kpis: (json['kpis'] as List<dynamic>)
            .map((e) => KpiData.fromJson(e as Map<String, dynamic>))
            .toList(),
        quickActions: (json['quickActions'] as List<dynamic>)
            .map((e) => QuickActionData.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  /// Creates a copy of this HomeData with optional new values.
  HomeData copyWith({
    List<AlertData>? alerts,
    List<ActivityData>? activities,
    List<AgendaData>? agenda,
    List<KpiData>? kpis,
    List<QuickActionData>? quickActions,
  }) => HomeData(
    alerts: alerts ?? this.alerts,
    activities: activities ?? this.activities,
    agenda: agenda ?? this.agenda,
    kpis: kpis ?? this.kpis,
    quickActions: quickActions ?? this.quickActions,
  );
}
