const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const config = {
  user: 'sa',
  password: '123456789',
  server: 'DESKTOP-AMFBBFK',
  database: 'Chamba',
  options:{ encrypt:true, trustServerCertificate:true }
};

async function conectarDB(){ try{ await sql.connect(config); console.log("Conectado a SQL Server ✅"); }catch(err){ console.error(err); } }

// --- Obtener bloques libres ---
async function obtenerBloquesPorFecha(fechaObj, cantidadHoras) {
  const bloques = [];
  const duracion = cantidadHoras * 60;
  const dias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const diaSemana = dias[fechaObj.getDay()];

  // Obtener hora actual en Perú solo si es hoy
  let ahoraMinutos = null;
  const hoyPeru = new Date().toLocaleString("es-PE", { timeZone: "America/Lima" });
  const hoyDate = new Date(hoyPeru.split(",")[0]);
  if (fechaObj.toDateString() === hoyDate.toDateString()) {
    const ahora = new Date(hoyPeru);
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
    ahoraMinutos = Math.ceil(minutosAhora / 30) * 30; // siguiente bloque de 30 min
  }

  // Horarios disponibles
  const horariosDisponibles = [
    { dia:'Lunes', inicio:'11:30', fin:'15:30' },
    { dia:'Martes', inicio:'18:00', fin:'19:00' },
    { dia:'Miércoles', inicio:'11:00', fin:'17:00' },
    { dia:'Jueves', inicio:'14:00', fin:'16:00' },
    { dia:'Viernes', inicio:'10:00', fin:'17:00' },
    { dia:'Sábado', inicio:'14:30', fin:'16:30' },
  ];

  // Generar bloques según disponibilidad y duración
  horariosDisponibles.forEach(h => {
    if (h.dia === diaSemana) {
      let [hInicio, mInicio] = h.inicio.split(':').map(Number);
      let inicioMin = hInicio * 60 + mInicio;
      const [hFin, mFin] = h.fin.split(':').map(Number);
      const finTotal = hFin * 60 + mFin;

      while (inicioMin + duracion <= finTotal) {
        // Solo agregar bloques que empiezan después de la hora actual (si es hoy)
        if (!ahoraMinutos || inicioMin >= ahoraMinutos) {
          bloques.push({ inicio: inicioMin, fin: inicioMin + duracion });
        }
        inicioMin += 30;
      }
    }
  });

  // Consultar reservas del día
  const fechaISO = fechaObj.toISOString().split('T')[0];
  const result = await sql.query`SELECT hora FROM Reservas WHERE fecha=${fechaISO}`;
  const reservas = result.recordset.map(r => {
    const [ini, fin] = r.hora.split(' - ').map(h => h.split(':').map(Number));
    return { inicio: ini[0]*60 + ini[1], fin: fin[0]*60 + fin[1] };
  });

  // Filtrar bloques que no se superpongan con reservas
  const bloquesLibres = bloques
    .filter(b => !reservas.some(r => b.inicio < r.fin && b.fin > r.inicio))
    .map(b => `${Math.floor(b.inicio/60).toString().padStart(2,'0')}:${(b.inicio%60).toString().padStart(2,'0')} - ${Math.floor(b.fin/60).toString().padStart(2,'0')}:${(b.fin%60).toString().padStart(2,'0')}`);

  return bloquesLibres;
}

// --- Endpoints ---
app.post('/calcular-precio', async(req,res)=>{
  try{
    const {correo,cantidadHoras}=req.body;
    const result=await sql.query`SELECT COUNT(*) AS total FROM Reservas WHERE correo=${correo}`;
    const total=result.recordset[0].total;
    const precio= (total>0?15:10)*cantidadHoras;
    res.json({precio,usuarioNuevo: total===0});
  }catch(err){ console.error(err); res.status(500).json({error:'Error calcular precio'});}
});

app.post('/bloques-libres', async(req,res)=>{
  try{
    const {fecha,cantidadHoras}=req.body;
    const bloques=await obtenerBloquesPorFecha(new Date(fecha),Number(cantidadHoras));
    res.json({bloques});
  }catch(err){ console.error(err); res.status(500).json({error:'Error obtener bloques'});}
});

app.post('/reservas', async(req,res)=>{
  try{
    const {nombre,correo,telefono,curso,modalidad,plataforma,cantidadHoras,fecha,hora}=req.body;
    const result=await sql.query`SELECT COUNT(*) AS total FROM Reservas WHERE correo=${correo}`;
    const total=result.recordset[0].total;
    const precio=(total>0?15:10)*cantidadHoras;
    await sql.query`INSERT INTO Reservas (nombre,correo,telefono,curso,modalidad,plataforma,cantidadHoras,fecha,hora,precio)
      VALUES (${nombre},${correo},${telefono},${curso},${modalidad},${plataforma},${cantidadHoras},${fecha},${hora},${precio})`;
    res.json({mensaje:'Reserva registrada',precio,usuarioNuevo: total===0});
  }catch(err){ console.error(err); res.status(500).json({error:'Error procesar reserva'});}
});

app.listen(port,()=>{console.log(`Servidor escuchando en http://localhost:${port}`);conectarDB();});
