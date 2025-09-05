// --- Conversión de horas ---
function horaAMinutos(hora) {
  const [h,m] = hora.split(':').map(Number);
  return h*60 + m;
}

function minutosAHora(minutos){
  const h = Math.floor(minutos/60);
  const m = minutos%60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
}

// --- Horarios disponibles ---
const horariosDisponibles = [
  { dia:'Lunes', inicio:'11:30', fin:'15:30' },
  { dia:'Martes', inicio:'18:00', fin:'19:00' },
  { dia:'Miércoles', inicio:'11:00', fin:'17:00' },
  { dia:'Jueves', inicio:'14:00', fin:'16:00' },
  { dia:'Viernes', inicio:'10:00', fin:'17:00' },
  { dia:'Sábado', inicio:'14:30', fin:'16:30' },
];

// --- Llenar select de fechas ---
function llenarSelectFechas(idFecha){
  const fechaSelect = document.getElementById(idFecha);
  const hoy = new Date();
  const dias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

  for (let i = 0; i < 14; i++) {
  const fecha = new Date(hoy.getTime() + i * 24 * 60 * 60 * 1000);
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');

  const diaJS = fecha.getDay();
  if(diaJS === 0) continue; // saltar domingo
  const diaSemana = dias[diaJS - 1];

  const opcion = document.createElement('option');
  opcion.value = fecha.toISOString().split('T')[0];
  opcion.textContent = `${diaSemana} ${dd}/${mm}/${yyyy}`;
  fechaSelect.appendChild(opcion);
  }
}

// --- Inicializar horarios ---
function inicializarHorarios(idFecha,idHora,idCantidadHoras){
  const fechaSelect = document.getElementById(idFecha);
  const horaSelect = document.getElementById(idHora);
  const cantHorasSelect = document.getElementById(idCantidadHoras);
  const correoInput = document.getElementById('correo');
  const precioInfo = document.getElementById('precioInfo');

  async function actualizarPrecio(){
    const correo = correoInput.value.trim();
    const cantidadHoras = Number(cantHorasSelect.value);
    if(!correo || !cantidadHoras){ precioInfo.textContent=''; return;}
    try{
      const resp = await fetch('http://localhost:3000/calcular-precio',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({correo,cantidadHoras})
      });
      const data = await resp.json();
      precioInfo.textContent = `Precio estimado: S/ ${data.precio} (${data.usuarioNuevo?'Descuento primer usuario':'Precio regular'})`;
    }catch(err){
      console.error(err);
      precioInfo.textContent='Error al calcular el precio';
    }
  }

  async function actualizarHoras(){
    const fecha = fechaSelect.value;
    const cantidadHoras = Number(cantHorasSelect.value);
    horaSelect.innerHTML='<option value="" disabled selected>Selecciona una hora</option>';
    if(fecha && cantidadHoras){
      try{
        const resp = await fetch('http://localhost:3000/bloques-libres',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({fecha,cantidadHoras})
        });
        const data = await resp.json();
        if(!data.bloques || data.bloques.length===0){
          const option=document.createElement('option');
          option.textContent='No hay horarios disponibles';
          option.disabled=true;
          horaSelect.appendChild(option);
        }else{
          const vistos = new Set();
          data.bloques.forEach(b=>{
            if(!vistos.has(b)){
              vistos.add(b);
              const option=document.createElement('option');
              option.value=b;
              option.textContent=b;
              horaSelect.appendChild(option);
            }
          });
        }
      }catch(err){
        console.error(err);
        const option=document.createElement('option');
        option.textContent='Error al cargar horarios';
        option.disabled=true;
        horaSelect.appendChild(option);
      }
    }
  }

  fechaSelect.addEventListener('change', actualizarHoras);
  cantHorasSelect.addEventListener('change', actualizarHoras);
  cantHorasSelect.addEventListener('change', actualizarPrecio);
  fechaSelect.addEventListener('change', actualizarPrecio);
  correoInput.addEventListener('input', actualizarPrecio);

  llenarSelectFechas(idFecha);
}
