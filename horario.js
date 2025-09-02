// horariosDisponibles.js
const horariosDisponibles = [
  { dia: 'Lunes', inicio: '11:30', fin: '15:30' },
  { dia: 'Martes', inicio: '10:00', fin: '13:00' },
  { dia: 'Martes', inicio: '18:00', fin: '19:00' },
  { dia: 'Miércoles', inicio: '11:00', fin: '17:00' },
  { dia: 'Jueves', inicio: '14:00', fin: '16:00' },
  { dia: 'Viernes', inicio: '10:00', fin: '17:00' },
  { dia: 'Sábado', inicio: '14:30', fin: '16:30' },
];

// Convertir "HH:MM" a minutos
function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// Convertir minutos a "HH:MM AM/PM"
function minutesToTime(min) {
  let h = Math.floor(min / 60);
  let m = min % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// Generar intervalos según cantidad de horas
function generarIntervalos(inicio, fin, cantidadHoras) {
  const start = timeToMinutes(inicio);
  const end = timeToMinutes(fin);
  const intervalos = [];

  for (let min = start; min + cantidadHoras * 60 <= end; min += 60) {
    const startTime = minutesToTime(min);
    const endTime = minutesToTime(min + cantidadHoras * 60);
    intervalos.push(`${startTime} - ${endTime}`);
  }
  return intervalos;
}

// Inicializar los select de día y hora
function inicializarHorarios(diaSelectId, horaSelectId, cantidadHorasSelectId) {
  const diaSelect = document.getElementById(diaSelectId);
  const horaSelect = document.getElementById(horaSelectId);
  const cantidadHorasSelect = document.getElementById(cantidadHorasSelectId);

  // Días únicos
  const diasUnicos = [...new Set(horariosDisponibles.map(h => h.dia))];
  diasUnicos.forEach(dia => {
    const option = document.createElement('option');
    option.value = dia;
    option.textContent = dia;
    diaSelect.appendChild(option);
  });

  // Función para actualizar horas
  function actualizarHoras() {
    const dia = diaSelect.value;
    const cantidadHoras = parseInt(cantidadHorasSelect.value);
    if (!dia || !cantidadHoras) return;

    const rangos = horariosDisponibles.filter(h => h.dia === dia);
    horaSelect.innerHTML = '<option value="" disabled selected>Selecciona una hora</option>';

    rangos.forEach(rango => {
      const intervalos = generarIntervalos(rango.inicio, rango.fin, cantidadHoras);
      intervalos.forEach(i => {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        horaSelect.appendChild(option);
      });
    });
  }

  // Escuchar cambios
  diaSelect.addEventListener('change', actualizarHoras);
  cantidadHorasSelect.addEventListener('change', actualizarHoras);
}
