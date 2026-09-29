export interface PreguntaFrecuente {
  id: number;
  pregunta: string;
  respuesta: string;
}

export const PREGUNTAS_FRECUENTES: PreguntaFrecuente[] = [
  {
    id: 1,
    pregunta: '¿Cómo registro un ingreso de material?',
    respuesta: 'Ve al módulo "Movimientos", elige el tipo "Ingreso", selecciona el material y la cantidad. La ubicación es opcional: si la dejas vacía, el sistema la asigna automáticamente.'
  },
  {
    id: 2,
    pregunta: '¿Cómo registro una salida hacia producción?',
    respuesta: 'En "Movimientos", elige el tipo "Salida", selecciona el material, la ubicación de origen y la cantidad. El sistema valida que haya stock suficiente antes de descontar.'
  },
  {
    id: 3,
    pregunta: '¿Cómo hago un inventario físico?',
    respuesta: 'En "Inventario físico", pulsa "Iniciar inventario": el sistema toma una foto del stock actual. Luego registra el conteo real de cada material y, cuando termines todos, pulsa "Cerrar inventario" para ajustar el stock automáticamente.'
  },
  {
    id: 4,
    pregunta: '¿Dónde veo si algún material está por agotarse?',
    respuesta: 'En "Stock" puedes ver el nivel de cada material con una barra de color. Los que están por debajo de su mínimo también aparecen listados en el módulo "Alertas".'
  },
  {
    id: 5,
    pregunta: '¿Cómo descargo un reporte en PDF o Excel?',
    respuesta: 'En "Reportes" elige el tipo de reporte (movimientos, kardex de un material o stock actual), aplica los filtros que necesites y pulsa el botón PDF o Excel correspondiente.'
  },
  {
    id: 6,
    pregunta: '¿Qué hago si olvidé mi contraseña?',
    respuesta: 'En la pantalla de inicio de sesión, pulsa "¿Olvidaste tu contraseña?". Recibirás un código de 6 dígitos por correo, lo ingresas, y luego defines una nueva contraseña.'
  },
  {
    id: 7,
    pregunta: '¿Cómo agrego un nuevo usuario al sistema?',
    respuesta: 'Esta opción solo está disponible para el rol Administrador, en el módulo "Usuarios". Ahí puedes crear cuentas nuevas, asignarles un rol y activarlas o desactivarlas.'
  },
  {
    id: 8,
    pregunta: '¿Qué es el kardex de un material?',
    respuesta: 'Es el historial completo de entradas y salidas de un material específico, con el saldo después de cada movimiento. Puedes verlo desde "Stock", pulsando el ícono de recibo junto a cualquier material.'
  }
];