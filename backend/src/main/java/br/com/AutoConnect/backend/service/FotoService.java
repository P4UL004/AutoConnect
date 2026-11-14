package br.com.AutoConnect.backend.service;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.com.AutoConnect.backend.dto.FotoResponse;
import br.com.AutoConnect.backend.exception.RegraNegocioException;
import br.com.AutoConnect.backend.model.DonoFoto;
import br.com.AutoConnect.backend.model.Foto;
import br.com.AutoConnect.backend.repository.FotoRepository;

@Service
public class FotoService {

    private final FotoRepository fotoRepository;
    private final String pastaUploads;

    public FotoService(FotoRepository fotoRepository,
                       @Value("${app.uploads.dir:uploads}") String pastaUploads) {
        this.fotoRepository = fotoRepository;
        this.pastaUploads = pastaUploads;
    }

    public FotoResponse salvar(DonoFoto donoTipo, Long donoId, MultipartFile arquivo,
                               boolean exigirResolucaoMinima) {
        // 1. Arquivo vazio
        if (arquivo == null || arquivo.isEmpty()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Arquivo não enviado ou vazio.");
        }

        // 2. Tamanho acima de 5 MB
        if (arquivo.getSize() > 5 * 1024 * 1024) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "A foto excede 5 MB.");
        }

        // 3. Formato REAL detectado pelo conteúdo com ImageIO (somente JPEG e PNG)
        BufferedImage imagem;
        String extensaoReal;

        try (InputStream is = arquivo.getInputStream();
             ImageInputStream iis = ImageIO.createImageInputStream(is)) {

            if (iis == null) {
                throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                        "O arquivo não é uma imagem JPG ou PNG válida.");
            }

            Iterator<ImageReader> leitores = ImageIO.getImageReaders(iis);
            if (!leitores.hasNext()) {
                throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                        "O arquivo não é uma imagem JPG ou PNG válida.");
            }

            ImageReader leitor = leitores.next();
            String formato = leitor.getFormatName();
            if (formato == null) {
                throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                        "O arquivo não é uma imagem JPG ou PNG válida.");
            }

            String formatoUpper = formato.toUpperCase();
            if ("JPEG".equals(formatoUpper) || "JPG".equals(formatoUpper)) {
                extensaoReal = "jpg";
            } else if ("PNG".equals(formatoUpper)) {
                extensaoReal = "png";
            } else {
                throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                        "O arquivo não é uma imagem JPG ou PNG válida.");
            }

            leitor.setInput(iis, true);
            imagem = leitor.read(0);
            leitor.dispose();

        } catch (IOException e) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "O arquivo não é uma imagem JPG ou PNG válida.");
        }

        if (imagem == null) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "O arquivo não é uma imagem JPG ou PNG válida.");
        }

        // 4. Se exigir resolução mínima, largura >= 1920 e altura >= 1080
        int largura = imagem.getWidth();
        int altura = imagem.getHeight();
        if (exigirResolucaoMinima && (largura < 1920 || altura < 1080)) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "A foto tem " + largura + "x" + altura + " pixels; o mínimo é 1920x1080.");
        }

        // Gravação física com UUID e extensão real
        String nomeArquivo = UUID.randomUUID().toString() + "." + extensaoReal;
        Path diretorioDestino = Paths.get(pastaUploads).toAbsolutePath().normalize();

        try {
            Files.createDirectories(diretorioDestino);
            Path arquivoDestino = diretorioDestino.resolve(nomeArquivo);
            try (InputStream is = arquivo.getInputStream()) {
                Files.copy(is, arquivoDestino, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new RegraNegocioException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao salvar o arquivo em disco.");
        }

        Foto foto = new Foto();
        foto.setDonoTipo(donoTipo);
        foto.setDonoId(donoId);
        foto.setNomeArquivo(nomeArquivo);
        foto.setNomeOriginal(arquivo.getOriginalFilename() != null ? arquivo.getOriginalFilename() : nomeArquivo);
        foto.setTamanhoBytes(arquivo.getSize());
        foto.setDataEnvio(LocalDateTime.now());

        Foto salva = fotoRepository.save(foto);
        return converterParaResponse(salva);
    }

    public List<FotoResponse> listar(DonoFoto donoTipo, Long donoId) {
        return fotoRepository.findByDonoTipoAndDonoIdOrderByDataEnvioAsc(donoTipo, donoId)
                .stream()
                .map(this::converterParaResponse)
                .toList();
    }

    public long contar(DonoFoto donoTipo, Long donoId) {
        return fotoRepository.countByDonoTipoAndDonoId(donoTipo, donoId);
    }

    public void remover(DonoFoto donoTipo, Long donoId, Long fotoId) {
        Foto foto = fotoRepository.findByIdAndDonoTipoAndDonoId(fotoId, donoTipo, donoId)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Foto não encontrada."));

        Path caminhoArquivo = Paths.get(pastaUploads).resolve(foto.getNomeArquivo()).toAbsolutePath().normalize();
        try {
            Files.deleteIfExists(caminhoArquivo);
        } catch (IOException ignored) {
            // Se o arquivo físico já não existir, continua para remover do banco
        }

        fotoRepository.delete(foto);
    }

    public Resource carregarArquivo(String nomeArquivo) {
        // Valida contra o banco para proteger contra ../ e caminhos arbitrários
        fotoRepository.findByNomeArquivo(nomeArquivo)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Foto não encontrada."));

        Path caminhoArquivo = Paths.get(pastaUploads).resolve(nomeArquivo).toAbsolutePath().normalize();
        try {
            Resource recurso = new UrlResource(caminhoArquivo.toUri());
            if (recurso.exists() && recurso.isReadable()) {
                return recurso;
            } else {
                throw new RegraNegocioException(HttpStatus.NOT_FOUND, "Arquivo não encontrado.");
            }
        } catch (MalformedURLException e) {
            throw new RegraNegocioException(HttpStatus.NOT_FOUND, "Arquivo não encontrado.");
        }
    }

    public FotoResponse converterParaResponse(Foto foto) {
        String url = "/api/fotos/arquivo/" + foto.getNomeArquivo();
        return new FotoResponse(
                foto.getId(),
                foto.getNomeArquivo(),
                foto.getNomeOriginal(),
                foto.getTamanhoBytes(),
                foto.getDataEnvio(),
                url
        );
    }
}
