import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { KeyRound, Loader2, Mail, Phone, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button, Card, Container, Input, Section } from "../components/UI";
import { getErrorMessage } from "../utils/format";

const Wrap = styled(Container)`
  display: flex;
  justify-content: center;
`;
const Box = styled(Card)`
  width: min(420px, 100%);
  padding: 40px 36px;
`;
const Head = styled.div`
  text-align: center;
  margin-bottom: 28px;
  h1 { font-size: 1.7rem; letter-spacing: -.03em; margin-bottom: 6px; }
  p { color: #667168; margin: 0; }
`;
const Field = styled.label`
  display: block;
  margin-bottom: 16px;
  span {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    font-size: .86rem;
    margin-bottom: 6px;
    color: #26352c;
  }
`;
const ErrorMsg = styled.p`
  background: #fff0f0;
  color: #b52e2e;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: .88rem;
  margin: 0 0 18px;
`;
const Switch = styled.p`
  margin: 22px 0 0;
  text-align: center;
  color: #667168;
  font-size: .92rem;
  a { color: #1d5c3a; font-weight: 700; }
`;
const Spin = styled(Loader2)`
  animation: spin .8s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// Recebe o form do <form onSubmit>, chama a função do AuthContext e trata sucesso/erro
function useAuthSubmit(action, redirectTo) {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const submit = async (event) => {
        event.preventDefault();
        const form = Object.fromEntries(new FormData(event.currentTarget));
        setError("");
        setLoading(true);
        try {
            await action(form);
            navigate(redirectTo ?? location.state?.from ?? "/", { replace: true });
        } catch (err) {
            setError(getErrorMessage(err, "Não foi possível concluir. Verifique os dados e tente novamente."));
        } finally {
            setLoading(false);
        }
    };

    return { submit, error, loading };
}

export function LoginPage() {
    const { signIn } = useAuth();
    const { submit, error, loading } = useAuthSubmit(signIn);

    return (
        <Section>
            <Wrap>
                <Box>
                    <Head>
                        <h1>Entrar na conta</h1>
                        <p>Acesse para continuar suas compras.</p>
                    </Head>
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                    <form onSubmit={submit}>
                        <Field>
                            <span><Mail size={15} /> E-mail</span>
                            <Input type="email" name="email" required autoComplete="email" placeholder="voce@email.com" />
                        </Field>
                        <Field>
                            <span><KeyRound size={15} /> Senha</span>
                            <Input type="password" name="senha" required autoComplete="current-password" placeholder="Sua senha" />
                        </Field>
                        <Button type="submit" disabled={loading} style={{ width: "100%" }}>
                            {loading ? <Spin size={18} /> : "Entrar"}
                        </Button>
                    </form>
                    <Switch>
                        Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
                    </Switch>
                </Box>
            </Wrap>
        </Section>
    );
}

export function RegisterPage() {
    const { signUp } = useAuth();
    const { submit, error, loading } = useAuthSubmit(signUp, "/login");

    return (
        <Section>
            <Wrap>
                <Box>
                    <Head>
                        <h1>Criar conta</h1>
                        <p>Leva menos de um minuto.</p>
                    </Head>
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                    <form onSubmit={submit}>
                        <Field>
                            <span><User size={15} /> Nome</span>
                            <Input name="nome" required autoComplete="name" placeholder="Seu nome completo" />
                        </Field>
                        <Field>
                            <span><Mail size={15} /> E-mail</span>
                            <Input type="email" name="email" required autoComplete="email" placeholder="voce@email.com" />
                        </Field>
                        <Field>
                            <span><Phone size={15} /> Telefone</span>
                            <Input type="tel" name="telefone" required autoComplete="tel" placeholder="(00) 00000-0000" />
                        </Field>
                        <Field>
                            <span><KeyRound size={15} /> Senha</span>
                            <Input type="password" name="senha" required minLength={6} autoComplete="new-password" placeholder="Crie uma senha" />
                        </Field>
                        <Button type="submit" disabled={loading} style={{ width: "100%" }}>
                            {loading ? <Spin size={18} /> : "Criar conta"}
                        </Button>
                    </form>
                    <Switch>
                        Já tem conta? <Link to="/login">Entrar</Link>
                    </Switch>
                </Box>
            </Wrap>
        </Section>
    );
}
