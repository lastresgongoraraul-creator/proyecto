package com.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportRequest {
    @NotBlank
    private String reason;
}
