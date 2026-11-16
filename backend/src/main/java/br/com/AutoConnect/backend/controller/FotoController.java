package br.com.AutoConnect.backend.controller;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.AutoConnect.backend.service.FotoService;

@RestController
@RequestMapping("/api/fotos")
public class FotoController {

    private final FotoService fotoService;

    public FotoController(FotoService fotoService) {
        this.fotoService = fotoService;
    }

    @GetMapping("/arquivo/{nome}")
    public ResponseEntity<Resource> servirArquivo(@PathVariable String nome) {
        Resource recurso = fotoService.carregarArquivo(nome);

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        String nomeMinusculo = nome.toLowerCase();
        if (nomeMinusculo.endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else if (nomeMinusculo.endsWith(".jpg") || nomeMinusculo.endsWith(".jpeg")) {
            mediaType = MediaType.IMAGE_JPEG;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + recurso.getFilename() + "\"")
                .body(recurso);
    }
}
