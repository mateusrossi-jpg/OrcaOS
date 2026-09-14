import 'package:aferix_flutter/core/error/app_exception.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('AppException hierarquia tipada', () {
    test('subtipos mapeiam categorias do outbox', () {
      expect(
        const AuthException('token inválido'),
        isA<AuthException>().having((e) => e.message, 'message', isNotEmpty),
      );
      expect(const SecurityException('tenant'), isA<SecurityException>());
      expect(const ValidationException('4xx'), isA<ValidationException>());
      expect(
        ConflictException('versões', remoteVersion: 2, localVersion: 1),
        isA<ConflictException>(),
      );
      expect(const ImmutableEntityException('OS'), isA<ImmutableEntityException>());
      expect(const MissingTenantException(), isA<MissingTenantException>());
      expect(const DatabaseException('db'), isA<DatabaseException>());
      expect(const SyncHaltedByAuthException(), isA<SyncHaltedByAuthException>());
    });

    test('AuthException carrega status code', () {
      const e = AuthException('401', statusCode: 401);
      expect(e.statusCode, 401);
      expect(e.toString(), contains('401'));
    });

    test('sealed — todo subtipo é AppException', () {
      final List<AppException> exceptions = [
        const NetworkException('x'),
        const AuthException('x'),
      ];
      for (final e in exceptions) {
        expect(e, isA<AppException>());
      }
    });
  });
}