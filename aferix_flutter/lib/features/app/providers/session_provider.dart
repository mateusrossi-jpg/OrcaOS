import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Sessão do tenant + usuário logado.
///
/// Dá origem ao isolamento multi-tenant (R10): ao trocar de tenant,
/// providers que observam [sessionProvider] são recalculados (RC2).
class SessionState {
  const SessionState({this.companyId = '', this.userId = ''});

  final String companyId;
  final String userId;

  bool get isGuest => companyId.isEmpty || userId.isEmpty;

  SessionState copyWith({String? companyId, String? userId}) => SessionState(
        companyId: companyId ?? this.companyId,
        userId: userId ?? this.userId,
      );
}

class SessionNotifier extends Notifier<SessionState> {
  @override
  SessionState build() => const SessionState();

  /// Troca de tenant — invalida banco e providers dependentes (RC2).
  void setTenant({required String companyId, required String userId}) {
    state = SessionState(companyId: companyId, userId: userId);
  }

  void clear() => state = const SessionState();
}

final sessionProvider =
    NotifierProvider<SessionNotifier, SessionState>(SessionNotifier.new);