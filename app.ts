import express = require("express");
import path = require("path");
import wrap = require("express-async-error-wrapper");
import Sql = require("./infra/sql");

const app = express();

app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req: express.Request, res: express.Response) => {
	res.sendFile(path.join(__dirname, "/views/index.html"));
});

app.get("/hist", (req: express.Request, res: express.Response) => {
	res.sendFile(path.join(__dirname, "/views/hist.html"));
});

app.get("/consultar", wrap(async (req: express.Request, res: express.Response) => {
	let saldoFinal = 0;

	await Sql.conectar(async (sql: Sql) => {

		saldoFinal = await sql.scalar("select saldo from carteira where id = 1");

	});

	res.json(saldoFinal);
}));

app.get("/consultarHistorico", wrap(async (req: express.Request, res: express.Response) => {
	let historico: any[] = null;

	await Sql.conectar(async (sql: Sql) => {

		historico = await sql.query("select quantia, saldo_final, date_format(data, '%d/%m/%Y %H:%i:%s') data from historico order by id_hist");

	});

	res.json(historico);
}));

app.get("/sacar", wrap(async (req: express.Request, res: express.Response) => {
	let q = req.query["quantia"] as string;

	if (!q) {
		res.status(400).json("Quantia inválida!");
		return;
	}

	let quantia = parseFloat(q.replace(",", "."));
	if (isNaN(quantia) || quantia <= 0) {
		res.status(400).json("Quantia inválida!");
		return;
	}

	let erro: string = null;
	let saldoFinal = 0;

	await Sql.conectar(async (sql: Sql) => {

		await sql.beginTransaction();

		await sql.query("update carteira set saldo = saldo - ? where id = 1 and saldo >= ?", [quantia, quantia]);

		if (!sql.linhasAfetadas) {
			erro = "Saldo insuficiente!";
		}

		saldoFinal = await sql.scalar("select saldo from carteira where id = 1");

		await sql.query("insert into historico (quantia, saldo_final, data) values (?, ?, now())", [-quantia, saldoFinal]);

		await sql.commit();

	});

	if (!erro) {
		res.json(saldoFinal);
	} else {
		res.status(400).json(erro);
	}
}));

app.get("/depositar", wrap(async (req: express.Request, res: express.Response) => {
	let q = req.query["quantia"] as string;

	if (!q) {
		res.status(400).json("Quantia inválida!");
		return;
	}

	let quantia = parseFloat(q.replace(",", "."));
	if (isNaN(quantia) || quantia <= 0) {
		res.status(400).json("Quantia inválida!");
		return;
	}

	let saldoFinal = 0;

	await Sql.conectar(async (sql: Sql) => {

		await sql.beginTransaction();

		await sql.query("update carteira set saldo = saldo + ? where id = 1", [quantia]);

		saldoFinal = await sql.scalar("select saldo from carteira where id = 1");

		await sql.query("insert into historico (quantia, saldo_final, data) values (?, ?, now())", [quantia, saldoFinal]);

		await sql.commit();

	});

	res.json(saldoFinal);
}));

const porta = (parseInt(process.env.PORT) || 3000);

app.listen(porta, () => {
	console.log("Executando servidor na porta " + porta);
});
