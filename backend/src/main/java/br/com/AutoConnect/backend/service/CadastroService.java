package br.com.AutoConnect.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.AutoConnect.backend.dto.CadastroRequest;
import br.com.AutoConnect.backend.exception.RegraNegocioException;
import br.com.AutoConnect.backend.model.Perfil;
import br.com.AutoConnect.backend.model.TipoPessoa;
import br.com.AutoConnect.backend.model.Usuario;
import br.com.AutoConnect.backend.repository.UsuarioRepository;
import br.com.AutoConnect.backend.util.ValidadorDocumento;

/** Cadastro publico de clientes (PF ou PJ). O perfil criado e sempre CLIENTE. */
@Service
public class CadastroService {

    private static final int SENHA_MINIMA = 8;

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public CadastroService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Usuario cadastrar(CadastroRequest dados) {
        if (dados == null) {
            throw erro("Dados do cadastro não informados.");
        }

        TipoPessoa tipo = dados.tipoPessoa();
        if (tipo == null) {
            throw erro("Informe se é pessoa física ou jurídica.");
        }

        String nome = dados.nome() == null ? "" : dados.nome().trim();
        if (nome.isEmpty()) {
            throw erro(tipo == TipoPessoa.PJ ? "Informe a razão social." : "Informe o nome.");
        }

        String email = dados.email() == null ? "" : dados.email().trim().toLowerCase();
        if (!email.matches("^\\S+@\\S+\\.\\S+$")) {
            throw erro("Informe um e-mail válido.");
        }

        String senha = dados.senha() == null ? "" : dados.senha();
        if (senha.length() < SENHA_MINIMA) {
            throw erro("A senha deve ter no mínimo " + SENHA_MINIMA + " caracteres.");
        }

        String documento = ValidadorDocumento.somenteDigitos(dados.documento());
        if (tipo == TipoPessoa.PF && !ValidadorDocumento.cpfValido(documento)) {
            throw erro("CPF inválido.");
        }
        if (tipo == TipoPessoa.PJ && !ValidadorDocumento.cnpjValido(documento)) {
            throw erro("CNPJ inválido.");
        }

        String telefone = ValidadorDocumento.somenteDigitos(dados.telefone());
        if (!telefone.isEmpty() && (telefone.length() < 10 || telefone.length() > 11)) {
            throw erro("Telefone inválido.");
        }

        if (usuarioRepository.existsByEmail(email)) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, "E-mail já cadastrado.");
        }
        if (usuarioRepository.existsByDocumento(documento)) {
            throw new RegraNegocioException(HttpStatus.CONFLICT,
                    (tipo == TipoPessoa.PF ? "CPF" : "CNPJ") + " já cadastrado.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(senha));
        usuario.setPerfil(Perfil.CLIENTE);
        usuario.setTipoPessoa(tipo);
        usuario.setDocumento(documento);
        usuario.setTelefone(telefone.isEmpty() ? null : telefone);
        return usuarioRepository.save(usuario);
    }

    private RegraNegocioException erro(String mensagem) {
        return new RegraNegocioException(HttpStatus.BAD_REQUEST, mensagem);
    }
}
