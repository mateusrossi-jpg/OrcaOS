import 'package:aferix_flutter/domain/models/home_data.dart';
import 'package:aferix_flutter/domain/models/alert_data.dart';
import 'package:aferix_flutter/domain/models/activity_data.dart';
import 'package:aferix_flutter/domain/models/agenda_data.dart';
import 'package:aferix_flutter/domain/models/kpi_data.dart';
import 'package:aferix_flutter/domain/models/quick_action_data.dart';
import 'package:aferix_flutter/domain/repositories/home_repository.dart';

class LocalHomeRepository implements HomeRepository {
  @override
  Future<HomeData> fetchHomeData() async {
    // Simulating small delay for operational realism.
    await Future.delayed(const Duration(milliseconds: 300));
    
    return HomeData(
      kpis: const [
        KpiData(title: 'Faturamento Mensal', value: '45.200', unit: ' R\$'),
        KpiData(title: 'Orçamentos Aprovados', value: '82', unit: '%'),
        KpiData(title: 'Serviços Pendentes', value: '14', unit: ''),
      ],
      alerts: [
        AlertData(
          id: 'alert_1',
          title: 'Orçamento Expirando',
          description: 'O orçamento #1042 expira hoje',
          timestamp: DateTime.now().subtract(const Duration(minutes: 30)),
          severity: AlertSeverity.warning,
        ),
        AlertData(
          id: 'alert_2',
          title: 'Serviço Atrasado',
          description: 'Instalação da OS #875 está pendente há 2 dias',
          timestamp: DateTime.now().subtract(const Duration(hours: 2)),
          severity: AlertSeverity.error,
        ),
        AlertData(
          id: 'alert_3',
          title: 'Novo Cliente Cadastrado',
          description: 'Cliente Mateus Rossi adicionado com sucesso',
          timestamp: DateTime.now().subtract(const Duration(hours: 5)),
          severity: AlertSeverity.info,
        ),
      ],
      agenda: [
        AgendaData(
          id: 'agenda_1',
          title: 'Reunião de Alinhamento',
          description: 'Alinhamento semanal com equipe técnica',
          startTime: DateTime.now().add(const Duration(hours: 1)),
          endTime: DateTime.now().add(const Duration(hours: 2)),
        ),
        AgendaData(
          id: 'agenda_2',
          title: 'Visita Técnica - Cliente Rossi',
          description: 'Medição preliminar no local do serviço',
          startTime: DateTime.now().add(const Duration(hours: 4)),
          endTime: DateTime.now().add(const Duration(hours: 5, minutes: 30)),
        ),
      ],
      activities: [
        ActivityData(
          id: 'activity_1',
          title: 'Orçamento Criado',
          description: 'Orçamento #1043 enviado para aprovação',
          timestamp: DateTime.now().subtract(const Duration(hours: 1)),
        ),
        ActivityData(
          id: 'activity_2',
          title: 'Pagamento Recebido',
          description: 'Sinal da OS #874 compensado com sucesso',
          timestamp: DateTime.now().subtract(const Duration(hours: 3)),
        ),
      ],
      quickActions: const [
        QuickActionData(
          label: 'Novo Orçamento',
          iconCodePoint: 0xe04c, // Icons.add_box codePoint
        ),
        QuickActionData(
          label: 'Ver Relatório',
          iconCodePoint: 0xe081, // Icons.analytics codePoint
        ),
      ],
    );
  }
}
