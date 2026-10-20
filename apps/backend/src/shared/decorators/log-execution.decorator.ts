/**
 * Decorator @LogExecution
 *
 * Aplica o padrão Decorator sobre métodos de serviço:
 * - Registra o nome do método e seus argumentos no console antes da execução.
 * - Registra o tempo total de execução (em ms) ao final.
 * - Em caso de erro, registra o erro e o relança, mantendo o comportamento original.
 *
 * Uso: anote qualquer método de serviço com @LogExecution()
 */
export function LogExecution(): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ): TypedPropertyDescriptor<any> {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = async function (...args: unknown[]) {
      const className = target.constructor.name;
      const methodName = String(propertyKey);
      const start = Date.now();

      console.log(
        `[LogExecution] ${className}.${methodName}() iniciado | args: ${JSON.stringify(args)}`,
      );

      try {
        const result = await originalMethod.apply(this, args);
        const elapsed = Date.now() - start;
        console.log(
          `[LogExecution] ${className}.${methodName}() concluído em ${elapsed}ms`,
        );
        return result;
      } catch (error) {
        const elapsed = Date.now() - start;
        console.error(
          `[LogExecution] ${className}.${methodName}() falhou em ${elapsed}ms | erro: ${String(error)}`,
        );
        throw error;
      }
    };

    return descriptor;
  };
}
