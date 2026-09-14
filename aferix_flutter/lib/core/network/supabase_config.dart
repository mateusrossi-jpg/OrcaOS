/// Configuração do Supabase lida de constantes de compilação.
///
/// Fase 0 exige apenas o esqueleto do SDK (`supabase_flutter`). Sem
/// `SUPABASE_URL`/`SUPABASE_ANON_KEY`, o sync roda em modo "não
/// configurado" e o [SyncEngine] pula push/pull sem quebrar o app.
class SupabaseConfig {
  const SupabaseConfig({
    this.url = '',
    this.anonKey = '',
  });

  /// URL do projeto. Defina via
  /// `--dart-define=SUPABASE_URL=https://<ref>.supabase.co`.
  final String url;

  /// Chave anônima. Defina via
  /// `--dart-define=SUPABASE_ANON_KEY=<key>`.
  final String anonKey;

  static SupabaseConfig fromEnv() => const SupabaseConfig(
        url: String.fromEnvironment('SUPABASE_URL'),
        anonKey: String.fromEnvironment('SUPABASE_ANON_KEY'),
      );

  bool get isConfigured => url.isNotEmpty && anonKey.isNotEmpty;
}