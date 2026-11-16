package br.com.AutoConnect.backend.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import javax.imageio.ImageIO;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;

import br.com.AutoConnect.backend.dto.FotoResponse;
import br.com.AutoConnect.backend.exception.RegraNegocioException;
import br.com.AutoConnect.backend.model.DonoFoto;
import br.com.AutoConnect.backend.model.Foto;
import br.com.AutoConnect.backend.repository.FotoRepository;

class FotoServiceTest {

    private FotoRepository fotoRepository;
    private FotoService fotoService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        fotoRepository = mock(FotoRepository.class);
        fotoService = new FotoService(fotoRepository, tempDir.toString());

        when(fotoRepository.save(any(Foto.class))).thenAnswer(invocation -> {
            Foto foto = invocation.getArgument(0);
            foto.setId(1L);
            return foto;
        });
    }

    private MockMultipartFile criarImagemMock(String nomeArquivo, int largura, int altura, String formato)
            throws IOException {
        BufferedImage imagem = new BufferedImage(largura, altura, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(imagem, formato, baos);
        return new MockMultipartFile("arquivo", nomeArquivo, "image/" + formato, baos.toByteArray());
    }

    @Test
    void deveAceitarFotoComResolucaoMinima1920x1080() throws IOException {
        MockMultipartFile imagemValida = criarImagemMock("foto_hd.jpg", 1920, 1080, "jpg");

        FotoResponse response = assertDoesNotThrow(
                () -> fotoService.salvar(DonoFoto.VEICULO, 1L, imagemValida, true));

        assertNotNull(response);
        assertNotNull(response.nomeArquivo());
    }

    @Test
    void deveRecusarFotoComResolucaoMenorQue1920x1080QuandoExigida() throws IOException {
        MockMultipartFile imagemPequena = criarImagemMock("pequena.jpg", 800, 600, "jpg");

        RegraNegocioException ex = assertThrows(RegraNegocioException.class,
                () -> fotoService.salvar(DonoFoto.VEICULO, 1L, imagemPequena, true));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("A foto tem 800x600 pixels; o mínimo é 1920x1080.", ex.getMessage());
    }

    @Test
    void deveRecusarTextoRenomeadoParaJpg() {
        MockMultipartFile fakeJpg = new MockMultipartFile(
                "arquivo",
                "documento.jpg",
                "image/jpeg",
                "Texto qualquer que não é imagem".getBytes(StandardCharsets.UTF_8)
        );

        RegraNegocioException ex = assertThrows(RegraNegocioException.class,
                () -> fotoService.salvar(DonoFoto.VEICULO, 1L, fakeJpg, true));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("O arquivo não é uma imagem JPG ou PNG válida.", ex.getMessage());
    }

    @Test
    void deveRecusarFotoAcimaDe5MB() {
        byte[] bytesGrandes = new byte[5 * 1024 * 1024 + 1];
        MockMultipartFile arquivoGrande = new MockMultipartFile(
                "arquivo",
                "foto_gigante.jpg",
                "image/jpeg",
                bytesGrandes
        );

        RegraNegocioException ex = assertThrows(RegraNegocioException.class,
                () -> fotoService.salvar(DonoFoto.VEICULO, 1L, arquivoGrande, true));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("A foto excede 5 MB.", ex.getMessage());
    }
}
