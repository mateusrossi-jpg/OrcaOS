import 'package:aferix_flutter/domain/models/home_data.dart';
import 'package:aferix_flutter/domain/models/alert_data.dart';
import 'package:aferix_flutter/domain/models/activity_data.dart';
import 'package:aferix_flutter/domain/models/agenda_data.dart';
import 'package:aferix_flutter/domain/models/kpi_data.dart';
import 'package:aferix_flutter/domain/models/quick_action_data.dart';

/// Factory providing deterministic fake HomeData instances for tests.
class FakeHomeDataFactory {
  /// Returns an empty HomeData (all lists empty).
  static HomeData empty() => HomeData(
        alerts: [],
        activities: [],
        agenda: [],
        kpis: [],
        quickActions: [],
      );

  /// Returns HomeData containing only alerts.
  static HomeData alertsOnly() => HomeData(
        alerts: [
          AlertData(
            id: 'a1',
            title: 'Alert 1',
            description: 'Desc',
            timestamp: DateTime.utc(2020, 1, 1),
            severity: AlertSeverity.info,
          ),
        ],
        activities: [],
        agenda: [],
        kpis: [],
        quickActions: [],
      );

  /// Returns HomeData containing only KPIs.
  static HomeData kpisOnly() => HomeData(
        alerts: [],
        activities: [],
        agenda: [],
        kpis: [
          KpiData(
            title: 'KPI 1',
            value: '42',
            unit: '',
          ),
        ],
        quickActions: [],
      );

  /// Returns a fully populated HomeData instance.
  static HomeData complete() => HomeData(
        alerts: [
          AlertData(
            id: 'a1',
            title: 'Alert',
            description: 'Desc',
            timestamp: DateTime.utc(2020, 1, 1),
            severity: AlertSeverity.info,
          ),
        ],
        activities: [
          ActivityData(
            id: 'act1',
            title: 'Activity',
            description: 'Desc',
            timestamp: DateTime.utc(2020, 1, 2),
          ),
        ],
        agenda: [
          AgendaData(
            id: 'ag1',
            title: 'Agenda',
            description: 'Desc',
            startTime: DateTime.utc(2020, 1, 3),
            endTime: DateTime.utc(2020, 1, 3, 1),
          ),
        ],
        kpis: [
          KpiData(
            title: 'KPI',
            value: '100',
            unit: '',
          ),
        ],
        quickActions: [
          QuickActionData(
            label: 'Action',
            iconCodePoint: 0,
            fontFamily: null,
          ),
        ],
      );
}
