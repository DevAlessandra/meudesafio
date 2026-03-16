import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Grafico({ transacoes }) {

  const entradas = transacoes
    .filter(t => t.tipo === "entrada")
    .reduce((total, t) => total + Number(t.valor), 0);

  const saidas = transacoes
    .filter(t => t.tipo === "saida")
    .reduce((total, t) => total + Number(t.valor), 0);

  const data = {
   
    labels: ["Receitas", "Despesas"],
    datasets: [
      {
        data: [entradas, saidas],
        backgroundColor: ["#8900c8", "#dce0a3"]
      }
    ]
  };

  return (
    <div style={{maxWidth:"150px", margin:"auto"}}>
      <Pie data={data}/>
    </div>
  );
}

export default Grafico;