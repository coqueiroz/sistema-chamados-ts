// ============================================================================
// PASSO 2: Tecnico (nasce fora do Chamado e tem vida própria)
// ============================================================================
class Tecnico {
  constructor(
    readonly id: number,
    readonly nome: string,
  ) {}
}

// ============================================================================
// PASSO 1: Chamado (encapsulamento com # e validações)
// ============================================================================
class Chamado {
  readonly id: number;
  #descricao: string;
  #horas: number[] = [];
  #tecnico: Tecnico | null = null; // agregação: guarda só a seta para o técnico

  constructor(id: number, descricao: string) {
    if (descricao.trim() === "") {
      throw new Error("A descrição do chamado não pode ser vazia.");
    }
    this.id = id;
    this.#descricao = descricao;
  }

  get descricao(): string {
    return this.#descricao;
  }

  // Porta única de entrada: só aqui a lista de horas é alterada.
  registrarHoras(horas: number): void {
    if (horas <= 0) {
      throw new Error(`Horas inválidas (${horas}): informe um valor maior que zero.`);
    }
    this.#horas.push(horas);
  }

  totalHoras(): number {
    let total = 0;
    for (let i = 0; i < this.#horas.length; i++) {
      total += this.#horas[i];
    }
    return total;
  }

  atribuirTecnico(tecnico: Tecnico): void {
    this.#tecnico = tecnico;
  }

  resumo(): string {
    const responsavel = this.#tecnico ? this.#tecnico.nome : "nenhum técnico atribuído";
    return `Chamado #${this.id} - ${this.#descricao} | Técnico: ${responsavel} | Total: ${this.totalHoras()}h`;
  }
}

// ============================================================================
// PASSO 3: ChamadoUrgente (herança e polimorfismo)
// ============================================================================
class ChamadoUrgente extends Chamado {
  readonly prazoLimite: number;

  constructor(id: number, descricao: string, prazoLimite: number) {
    super(id, descricao);
    this.prazoLimite = prazoLimite;
  }

  prazoEstourado(): boolean {
    return this.totalHoras() > this.prazoLimite;
  }

  // Sobrescrita: reaproveita o resumo da classe mãe e acrescenta o aviso.
  override resumo(): string {
    const aviso = this.prazoEstourado()
      ? `⚠️ PRAZO ESTOURADO! (limite de ${this.prazoLimite}h)`
      : `✅ Dentro do prazo (limite de ${this.prazoLimite}h)`;
    return `${super.resumo()} | ${aviso}`;
  }
}

// ============================================================================
// TESTES
// ============================================================================

// 1. Técnico
const carlos = new Tecnico(1, "Carlos");

// 2. Chamado comum: 2h + 1h
const chamado1 = new Chamado(101, "Impressora não liga");
chamado1.atribuirTecnico(carlos);
chamado1.registrarHoras(2);
chamado1.registrarHoras(1);

// 3. Chamado urgente com prazo de 4h: 3h + 2h (estoura)
const chamado2 = new ChamadoUrgente(102, "Servidor fora do ar", 4);
chamado2.atribuirTecnico(carlos);
chamado2.registrarHoras(3);
chamado2.registrarHoras(2);

// 4. Mesma lista, mesmo método: cada objeto executa o seu resumo (late binding)
const chamados: Chamado[] = [chamado1, chamado2];
console.log("=== Resumo dos chamados ===");
for (const chamado of chamados) {
  console.log(chamado.resumo());
}

// Validações
console.log("\n=== Testes de validação ===");
try {
  new Chamado(103, "   ");
} catch (e) {
  console.log("Erro esperado:", (e as Error).message);
}
try {
  chamado1.registrarHoras(0);
} catch (e) {
  console.log("Erro esperado:", (e as Error).message);
}
try {
  chamado1.registrarHoras(-5);
} catch (e) {
  console.log("Erro esperado:", (e as Error).message);
}
console.log("Total do chamado 101 continua:", chamado1.totalHoras() + "h");

// 5. Teste de segurança
// Escrever "chamado1.#descricao" direto no código faz o tsc recusar:
//   error TS18013: Property '#descricao' is not accessible outside class
//   'Chamado' because it has a private identifier.
// Por isso a tentativa é feita via eval, como se fosse digitada no console:
// assim o motor JS acusa o erro em tempo de execução e o programa continua.
console.log("\n=== Teste de segurança ===");
try {
  eval("chamado1.#descricao");
} catch (e) {
  console.log("Motor JS recusou chamado1.#descricao:", `${(e as Error).name}: ${(e as Error).message}`);
}
// Nem burlando o compilador com "as any" dá para chegar no campo:
console.log("(chamado1 as any).descricao =", (chamado1 as any).descricao); // passa pelo getter (leitura)
console.log("(chamado1 as any)['#descricao'] =", (chamado1 as any)["#descricao"]); // undefined
console.log("Object.keys(chamado1) =", Object.keys(chamado1)); // só ["id"]: os # não aparecem

// O técnico sobrevive independentemente do chamado (agregação)
console.log("Técnico continua existindo:", carlos.nome);
