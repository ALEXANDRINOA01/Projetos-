class CalculadoraCientifica:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Calculadora Científica")
        self.root.resizable(False, False)
        self.root.configure(bg="#1a1d23")

        self.expressao = ""
        self.resultado_exibido = False
        self.modo_graus = True  # True = graus, False = radianos

        self._criar_interface()
        self._vincular_teclado()

    def _criar_interface(self) -> None:
        cores = {
            "fundo": "#1a1d23",
            "display": "#12141a",
            "texto": "#e8eaed",
            "secundario": "#9aa0a6",
            "numero": "#2a2f3a",
            "numero_hover": "#363c4a",
            "funcao": "#252a35",
            "operador": "#3d5a80",
            "igual": "#ee6c4d",
            "limpar": "#c44536",
        }

        fonte_display = tkfont.Font(family="Consolas", size=28, weight="bold")
        fonte_hist = tkfont.Font(family="Consolas", size=11)
        fonte_btn = tkfont.Font(family="Segoe UI", size=11, weight="bold")
        fonte_modo = tkfont.Font(family="Segoe UI", size=9)

        # Display
        frame_display = tk.Frame(self.root, bg=cores["display"], padx=16, pady=12)
        frame_display.pack(fill="x", padx=10, pady=(10, 6))

        self.lbl_historico = tk.Label(
            frame_display,
            text="",
            anchor="e",
            bg=cores["display"],
            fg=cores["secundario"],
            font=fonte_hist,
            height=1,
        )
        self.lbl_historico.pack(fill="x")

        self.lbl_display = tk.Label(
            frame_display,
            text="0",
            anchor="e",
            bg=cores["display"],
            fg=cores["texto"],
            font=fonte_display,
            height=1,
        )
        self.lbl_display.pack(fill="x")

        # Modo graus/radianos
        frame_modo = tk.Frame(self.root, bg=cores["fundo"])
        frame_modo.pack(fill="x", padx=12, pady=(0, 4))

        self.lbl_modo = tk.Label(
            frame_modo,
            text="Modo: DEG",
            bg=cores["fundo"],
            fg=cores["secundario"],
            font=fonte_modo,
            anchor="w",
        )
        self.lbl_modo.pack(side="left")

        # Botões
        frame_botoes = tk.Frame(self.root, bg=cores["fundo"], padx=8, pady=8)
        frame_botoes.pack()

        # (texto, comando, cor_fundo, coluna span)
        botoes = [
            [
                ("DEG", self._alternar_modo, cores["funcao"]),
                ("π", lambda: self._inserir("π"), cores["funcao"]),
                ("e", lambda: self._inserir("e"), cores["funcao"]),
                ("C", self._limpar, cores["limpar"]),
                ("⌫", self._apagar, cores["limpar"]),
            ],
            [
                ("sin", lambda: self._funcao("sin"), cores["funcao"]),
                ("cos", lambda: self._funcao("cos"), cores["funcao"]),
                ("tan", lambda: self._funcao("tan"), cores["funcao"]),
                ("(", lambda: self._inserir("("), cores["funcao"]),
                (")", lambda: self._inserir(")"), cores["funcao"]),
            ],
            [
                ("asin", lambda: self._funcao("asin"), cores["funcao"]),
                ("acos", lambda: self._funcao("acos"), cores["funcao"]),
                ("atan", lambda: self._funcao("atan"), cores["funcao"]),
                ("x²", lambda: self._inserir("²"), cores["funcao"]),
                ("√", lambda: self._funcao("√"), cores["funcao"]),
            ],
            [
                ("ln", lambda: self._funcao("ln"), cores["funcao"]),
                ("log", lambda: self._funcao("log"), cores["funcao"]),
                ("xʸ", lambda: self._inserir("^"), cores["funcao"]),
                ("1/x", lambda: self._funcao("1/"), cores["funcao"]),
                ("n!", lambda: self._inserir("!"), cores["funcao"]),
            ],
            [
                ("7", lambda: self._inserir("7"), cores["numero"]),
                ("8", lambda: self._inserir("8"), cores["numero"]),
                ("9", lambda: self._inserir("9"), cores["numero"]),
                ("÷", lambda: self._inserir("÷"), cores["operador"]),
                ("%", lambda: self._inserir("%"), cores["operador"]),
            ],
            [
                ("4", lambda: self._inserir("4"), cores["numero"]),
                ("5", lambda: self._inserir("5"), cores["numero"]),
                ("6", lambda: self._inserir("6"), cores["numero"]),
                ("×", lambda: self._inserir("×"), cores["operador"]),
                ("±", self._negar, cores["operador"]),
            ],
            [
                ("1", lambda: self._inserir("1"), cores["numero"]),
                ("2", lambda: self._inserir("2"), cores["numero"]),
                ("3", lambda: self._inserir("3"), cores["numero"]),
                ("−", lambda: self._inserir("−"), cores["operador"]),
                ("=", self._calcular, cores["igual"]),
            ],
            [
                ("0", lambda: self._inserir("0"), cores["numero"]),
                (".", lambda: self._inserir("."), cores["numero"]),
                ("|x|", lambda: self._funcao("abs"), cores["funcao"]),
                ("+", lambda: self._inserir("+"), cores["operador"]),
                ("Ans", self._usar_ans, cores["funcao"]),
            ],
        ]

        self._ultimo_resultado = "0"

        for r, linha in enumerate(botoes):
            for c, (texto, cmd, cor) in enumerate(linha):
                btn = tk.Button(
                    frame_botoes,
                    text=texto,
                    command=cmd,
                    font=fonte_btn,
                    bg=cor,
                    fg=cores["texto"],
                    activebackground=cores["numero_hover"],
                    activeforeground=cores["texto"],
                    relief="flat",
                    bd=0,
                    width=5,
                    height=2,
                    cursor="hand2",
                )
                btn.grid(row=r, column=c, padx=3, pady=3, sticky="nsew")

        for i in range(5):
            frame_botoes.columnconfigure(i, weight=1)

    def _vincular_teclado(self) -> None:
        mapa = {
            "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
            "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
            ".": ".", "+": "+", "-": "−", "*": "×", "/": "÷",
            "^": "^", "%": "%", "(": "(", ")": ")",
        }
        for tecla, simbolo in mapa.items():
            self.root.bind(tecla, lambda e, s=simbolo: self._inserir(s))
        self.root.bind("<Return>", lambda e: self._calcular())
        self.root.bind("<KP_Enter>", lambda e: self._calcular())
        self.root.bind("<BackSpace>", lambda e: self._apagar())
        self.root.bind("<Escape>", lambda e: self._limpar())
        self.root.bind("<Delete>", lambda e: self._limpar())

    def _atualizar_display(self) -> None:
        texto = self.expressao if self.expressao else "0"
        if len(texto) > 22:
            texto = "…" + texto[-21:]
        self.lbl_display.config(text=texto)

    def _inserir(self, valor: str) -> None:
        if self.resultado_exibido and valor not in "+−×÷^%":
            self.expressao = ""
        elif self.resultado_exibido and valor in "+−×÷^%":
            self.expressao = self._ultimo_resultado
        self.resultado_exibido = False
        self.expressao += valor
        self._atualizar_display()

    def _funcao(self, nome: str) -> None:
        if self.resultado_exibido:
            self.expressao = ""
            self.resultado_exibido = False
        if nome == "√":
            self.expressao += "√("
        elif nome == "1/":
            self.expressao += "1/("
        elif nome == "abs":
            self.expressao += "abs("
        else:
            self.expressao += f"{nome}("
        self._atualizar_display()

    def _limpar(self) -> None:
        self.expressao = ""
        self.resultado_exibido = False
        self.lbl_historico.config(text="")
        self._atualizar_display()

    def _apagar(self) -> None:
        if self.resultado_exibido:
            self._limpar()
            return
        self.expressao = self.expressao[:-1]
        self._atualizar_display()

    def _negar(self) -> None:
        if self.resultado_exibido:
            self.expressao = self._ultimo_resultado
            self.resultado_exibido = False
        if not self.expressao:
            self.expressao = "−"
        elif self.expressao.startswith("−"):
            self.expressao = self.expressao[1:]
        else:
            self.expressao = "−" + self.expressao
        self._atualizar_display()

    def _alternar_modo(self) -> None:
        self.modo_graus = not self.modo_graus
        self.lbl_modo.config(text=f"Modo: {'DEG' if self.modo_graus else 'RAD'}")

    def _usar_ans(self) -> None:
        if self.resultado_exibido:
            self.expressao = ""
            self.resultado_exibido = False
        self.expressao += self._ultimo_resultado
        self._atualizar_display()

    def _preparar_expressao(self, expr: str) -> str:
        """Converte a expressão visual em Python avaliável."""
        import re

        expr = expr.replace("×", "*").replace("÷", "/").replace("−", "-")
        expr = expr.replace("π", str(math.pi)).replace("e", str(math.e))
        expr = expr.replace("^", "**").replace("%", "/100")
        expr = expr.replace("√", "sqrt").replace("²", "**2")

        # Fatorial de número: 5! → factorial(5)
        expr = re.sub(r"(\d+(?:\.\d+)?)!", r"factorial(\1)", expr)

        # Fatorial de grupo: (...)! → factorial(...)
        while ")!" in expr:
            idx = expr.index(")!")
            nivel = 0
            inicio = idx
            for j in range(idx, -1, -1):
                if expr[j] == ")":
                    nivel += 1
                elif expr[j] == "(":
                    nivel -= 1
                    if nivel == 0:
                        inicio = j
                        break
            trecho = expr[inicio : idx + 1]
            expr = expr[:inicio] + f"factorial{trecho}" + expr[idx + 2 :]

        return expr
    def _angulo(self, x: float) -> float:
        return math.radians(x) if self.modo_graus else x

    def _angulo_inverso(self, x: float) -> float:
        return math.degrees(x) if self.modo_graus else x

    def _calcular(self) -> None:
        if not self.expressao:
            return
        expressao_original = self.expressao
        try:
            expr = self._preparar_expressao(self.expressao)

            ambiente = {
                "sin": lambda x: math.sin(self._angulo(x)),
                "cos": lambda x: math.cos(self._angulo(x)),
                "tan": lambda x: math.tan(self._angulo(x)),
                "asin": lambda x: self._angulo_inverso(math.asin(x)),
                "acos": lambda x: self._angulo_inverso(math.acos(x)),
                "atan": lambda x: self._angulo_inverso(math.atan(x)),
                "ln": math.log,
                "log": math.log10,
                "sqrt": math.sqrt,
                "abs": abs,
                "factorial": lambda x: math.factorial(int(x)),
                "math": math,
            }

            resultado = eval(expr, {"__builtins__": {}}, ambiente)

            if isinstance(resultado, float):
                if abs(resultado) < 1e-12:
                    resultado = 0.0
                # Formatar sem zeros desnecessários
                texto = f"{resultado:.12g}"
            else:
                texto = str(resultado)

            self.lbl_historico.config(text=expressao_original + " =")
            self.expressao = texto
            self._ultimo_resultado = texto
            self.resultado_exibido = True
            self._atualizar_display()
        except ZeroDivisionError:
            self._mostrar_erro("Divisão por zero")
        except ValueError:
            self._mostrar_erro("Valor inválido")
        except Exception:
            self._mostrar_erro("Erro de expressão")

    def _mostrar_erro(self, msg: str) -> None:
        self.lbl_historico.config(text=self.expressao)
        self.lbl_display.config(text=msg)
        self.expressao = ""
        self.resultado_exibido = True


def main() -> None:
    root = tk.Tk()
    CalculadoraCientifica(root)
    root.mainloop()


if __name__ == "__main__":
    main()