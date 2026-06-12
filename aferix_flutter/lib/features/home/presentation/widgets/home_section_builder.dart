import 'package:flutter/material.dart';
import '../states/home_state.dart';
import 'empty_home_section.dart';
import 'alert_section.dart';
import 'activity_section.dart';
import 'agenda_section.dart';
import 'kpi_section.dart';
import 'quick_action_section.dart';

/// Builds appropriate home sections based on [HomeState].
class HomeSectionBuilder extends StatelessWidget {
  final HomeState state;

  const HomeSectionBuilder({required this.state, super.key});

  @override
  Widget build(BuildContext context) {
    if (state.status == HomeStatus.loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (state.status == HomeStatus.error) {
      return Center(child: Text(state.errorMessage ?? 'Error'));
    }
    if (state.status != HomeStatus.success || state.data == null) {
      return const EmptyHomeSection();
    }
    final data = state.data!;
    final List<Widget> sections = [];
    if (data.alerts.isNotEmpty) sections.add(AlertSection(alerts: data.alerts));
    if (ActivitySection.canRender(data.activities)) {
      sections.add(ActivitySection(activities: data.activities));
    }
    if (AgendaSection.canRender(data.agenda)) {
      sections.add(AgendaSection(agenda: data.agenda));
    }
    if (data.kpis.isNotEmpty) sections.add(KpiSection(kpis: data.kpis));
    if (data.quickActions.isNotEmpty) sections.add(QuickActionSection(quickActions: data.quickActions));
    if (sections.isEmpty) return const EmptyHomeSection();
    return ListView(padding: const EdgeInsets.all(16), children: sections);
  }
}
