/**
 * Función de transformación de conveniencia:
 * Simplemente clona el objeto, pero aquí puedes renombrar selectores,
 * agregar prefijos, validaciones, etc.
 */
export const prepareComponents = (
  cssObj: Record<string, any>
): Record<string, any> => ({
  ...cssObj
});


