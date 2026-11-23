package com.example.CalcGastosU.optimization.service;

import com.example.CalcGastosU.entity.Necesidad;
import com.example.CalcGastosU.entity.Presupuesto;
import com.example.CalcGastosU.optimization.dto.OptimizationCategoryDTO;
import com.example.CalcGastosU.optimization.dto.OptimizationDistributionDTO;
import com.example.CalcGastosU.optimization.dto.OptimizationPreloadCategoryDTO;
import com.example.CalcGastosU.optimization.dto.OptimizationPreloadResponseDTO;
import com.example.CalcGastosU.optimization.dto.OptimizationRequestDTO;
import com.example.CalcGastosU.optimization.dto.OptimizationResponseDTO;
import com.example.CalcGastosU.optimization.exception.OptimizationException;
import com.example.CalcGastosU.repository.NecesidadRepository;
import com.example.CalcGastosU.repository.PresupuestoRepository;
import com.example.CalcGastosU.security.SecurityUtils;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class OptimizationService {

    @Autowired
    private PresupuestoRepository presupuestoRepository;

    @Autowired
    private NecesidadRepository necesidadRepository;

    public OptimizationResponseDTO optimize(OptimizationRequestDTO request) {
        if (request == null) {
            throw new OptimizationException("La solicitud de optimización es requerida");
        }

        Presupuesto presupuesto = resolveBudget(request);
        BigDecimal available = money(presupuesto.getMonto());
        if (available == null || available.signum() < 0) {
            throw new OptimizationException("El presupuesto debe ser válido y no negativo");
        }

        SecurityUtils.getAuthenticatedIdPerfil()
                .orElseThrow(() -> new SecurityException("Sesión sin perfil asociado"));
        ObjectId idPeriodo = new ObjectId(request.getIdPeriodo());
        List<Necesidad> needs = resolveNeeds(presupuesto, idPeriodo);
        if (needs.isEmpty()) {
            throw new OptimizationException("El periodo seleccionado no tiene necesidades para optimizar");
        }
        if (request.getCategorias() == null || request.getCategorias().isEmpty()) {
            throw new OptimizationException("Debe incluir todas las necesidades del periodo");
        }

        Map<String, Necesidad> needsById = new HashMap<>();
        for (Necesidad need : needs) {
            if (need.getId() == null) {
                throw new OptimizationException("Se encontró una necesidad sin identificador");
            }
            needsById.put(need.getId().toHexString(), need);
        }

        Set<String> submittedIds = new HashSet<>();
        List<OptimizationCategoryDTO> validated = new ArrayList<>();
        BigDecimal minimumTotal = BigDecimal.ZERO;

        for (OptimizationCategoryDTO category : request.getCategorias()) {
            if (category == null || category.getIdNecesidad() == null
                    || !ObjectId.isValid(category.getIdNecesidad())) {
                throw new OptimizationException("Cada necesidad debe incluir un identificador válido");
            }

            String id = category.getIdNecesidad();
            if (!submittedIds.add(id)) {
                throw new OptimizationException("No se permiten necesidades duplicadas");
            }
            if (!needsById.containsKey(id)) {
                throw new OptimizationException("Una necesidad enviada no pertenece al usuario, presupuesto y periodo seleccionados");
            }

            BigDecimal minimum = money(category.getMinimum());
            BigDecimal maximum = money(category.getMaximum());
            if (minimum == null || maximum == null
                    || minimum.signum() < 0 || maximum.signum() < 0) {
                throw new OptimizationException("Los mínimos y máximos deben ser válidos y no negativos");
            }
            if (minimum.compareTo(maximum) > 0) {
                throw new OptimizationException("El mínimo de una necesidad no puede superar su máximo");
            }

            minimumTotal = minimumTotal.add(minimum);
            validated.add(category);
        }

        if (!submittedIds.equals(needsById.keySet())) {
            throw new OptimizationException("La solicitud debe incluir cada necesidad del periodo exactamente una vez");
        }

        if (minimumTotal.compareTo(available) > 0) {
            BigDecimal additional = minimumTotal.subtract(available);
            throw new OptimizationException(
                    "El presupuesto es insuficiente para cubrir los mínimos establecidos. Necesitas "
                            + format(additional) + " adicionales o reducir algunos valores mínimos.",
                    true);
        }

        List<OptimizationDistributionDTO> distribution = new ArrayList<>();
        for (OptimizationCategoryDTO category : validated) {
            Necesidad need = needsById.get(category.getIdNecesidad());
            BigDecimal minimum = money(category.getMinimum());
            BigDecimal maximum = money(category.getMaximum());
            BigDecimal real = money(need.getMonto());
            if (real == null) {
                real = BigDecimal.ZERO;
            }

            distribution.add(new OptimizationDistributionDTO(
                    need.getId().toHexString(),
                    firstNonBlank(need.getDescripcion(), need.getTipo(), "Necesidad"),
                    need.getDescripcion(),
                    need.getTipo(),
                    need.getEsPredeterminada(),
                    asDouble(minimum),
                    asDouble(maximum),
                    asDouble(minimum),
                    asDouble(real),
                    asDouble(real.subtract(minimum)),
                    real.compareTo(maximum) > 0));
        }

        BigDecimal savings = available.subtract(minimumTotal);
        BigDecimal savingsPercentage = available.signum() > 0
                ? savings.multiply(BigDecimal.valueOf(100))
                        .divide(available, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new OptimizationResponseDTO(
                true,
                "OPTIMO",
                asDouble(available),
                asDouble(minimumTotal),
                asDouble(savings),
                asDouble(savingsPercentage),
                distribution,
                "Distribución óptima calculada: cada necesidad recibe su mínimo y el resto se destina al ahorro.");
    }

    public OptimizationPreloadResponseDTO preload(ObjectId idPeriodo) {
        return preload(idPeriodo, null);
    }

    public OptimizationPreloadResponseDTO preload(ObjectId idPeriodo, ObjectId idPresupuesto) {
        ObjectId authenticatedProfile = SecurityUtils.getAuthenticatedIdPerfil()
                .orElseThrow(() -> new SecurityException("Sesión sin perfil asociado"));
        Presupuesto presupuesto;
        if (idPresupuesto == null) {
            presupuesto = presupuestoRepository.findByIdPerfilAndIdPeriodo(authenticatedProfile, idPeriodo)
                    .orElseThrow(() -> new OptimizationException(
                            "Presupuesto no encontrado para el periodo seleccionado"));
        } else {
            presupuesto = presupuestoRepository.findById(idPresupuesto)
                    .orElseThrow(() -> new OptimizationException("Presupuesto no encontrado"));
        }
        SecurityUtils.esMismoIdPerfilOAdmin(presupuesto.getIdPerfil());
        if (!idPeriodo.equals(presupuesto.getIdPeriodo())) {
            throw new OptimizationException("El presupuesto no corresponde al periodo seleccionado");
        }
        if (presupuesto.getIdPerfil() == null
                || (!SecurityUtils.isAdmin() && !authenticatedProfile.equals(presupuesto.getIdPerfil()))) {
            throw new SecurityException("Acceso denegado: el presupuesto no pertenece al usuario autenticado");
        }

        BigDecimal available = money(presupuesto.getMonto());
        if (available == null || available.signum() < 0) {
            throw new OptimizationException("El presupuesto debe ser válido y no negativo");
        }

        List<Necesidad> needs = resolveNeeds(presupuesto, idPeriodo);
        List<OptimizationPreloadCategoryDTO> categories = new ArrayList<>();
        BigDecimal minimumTotal = BigDecimal.ZERO;

        for (Necesidad need : needs) {
            if (need.getId() == null) {
                throw new OptimizationException("Se encontró una necesidad sin identificador");
            }
            BigDecimal registered = money(need.getMonto());
            if (registered == null) {
                registered = BigDecimal.ZERO;
            }
            if (registered.signum() < 0) {
                throw new OptimizationException(
                        "La necesidad " + firstNonBlank(need.getDescripcion(), "sin descripción")
                                + " tiene un monto registrado negativo.");
            }

            BigDecimal suggestedMinimum = roundPesos(registered);
            minimumTotal = minimumTotal.add(suggestedMinimum);
            categories.add(new OptimizationPreloadCategoryDTO(
                    need.getId().toHexString(),
                    firstNonBlank(need.getDescripcion(), need.getTipo(), "Necesidad"),
                    need.getDescripcion(),
                    need.getTipo(),
                    need.getEsPredeterminada(),
                    asDouble(suggestedMinimum),
                    asDouble(suggestedMinimum),
                    asDouble(registered)));
        }

        minimumTotal = roundPesos(minimumTotal);
        BigDecimal margin = available.subtract(minimumTotal);
        if (margin.signum() < 0) {
            return new OptimizationPreloadResponseDTO(
                    false,
                    asDouble(available),
                    asDouble(minimumTotal),
                    asDouble(margin),
                    categories,
                    "Los montos sugeridos superan el presupuesto. Necesitas "
                            + format(margin.abs()) + " adicionales o reducir algunos mínimos.");
        }

        if (minimumTotal.signum() > 0 && margin.signum() > 0) {
            suggestMaximums(categories, margin, minimumTotal);
        }

        return new OptimizationPreloadResponseDTO(
                true,
                asDouble(available),
                asDouble(minimumTotal),
                asDouble(margin),
                categories,
                "Cada necesidad se precargó individualmente; el monto registrado es una sugerencia editable.");
    }

    private void suggestMaximums(
            List<OptimizationPreloadCategoryDTO> categories,
            BigDecimal margin,
            BigDecimal minimumTotal) {
        List<OptimizationPreloadCategoryDTO> eligible = new ArrayList<>();
        Map<String, BigDecimal> remainders = new HashMap<>();
        BigDecimal allocatedMargin = BigDecimal.ZERO;

        for (OptimizationPreloadCategoryDTO category : categories) {
            BigDecimal minimum = money(category.getMinimum());
            if (minimum.signum() == 0) {
                continue;
            }

            BigDecimal[] share = margin.multiply(minimum).divideAndRemainder(minimumTotal);
            category.setMaximum(asDouble(minimum.add(share[0])));
            eligible.add(category);
            remainders.put(category.getIdNecesidad(), share[1]);
            allocatedMargin = allocatedMargin.add(share[0]);
        }

        int remainingPesos = margin.subtract(allocatedMargin).intValueExact();
        eligible.sort(Comparator.comparing(
                (OptimizationPreloadCategoryDTO category) -> remainders.get(category.getIdNecesidad()))
                .reversed());
        for (int index = 0; index < remainingPesos; index++) {
            OptimizationPreloadCategoryDTO category = eligible.get(index);
            category.setMaximum(asDouble(money(category.getMaximum()).add(BigDecimal.ONE)));
        }
    }

    private Presupuesto resolveBudget(OptimizationRequestDTO request) {
        if (request.getIdPeriodo() == null || !ObjectId.isValid(request.getIdPeriodo())) {
            throw new OptimizationException("Se requiere un identificador de periodo válido");
        }
        ObjectId idPeriodo = new ObjectId(request.getIdPeriodo());
        ObjectId idPerfil = SecurityUtils.getAuthenticatedIdPerfil()
                .orElseThrow(() -> new SecurityException("Sesión sin perfil asociado"));

        Presupuesto presupuesto;
        if (request.getIdPresupuesto() != null && !request.getIdPresupuesto().trim().isEmpty()) {
            if (!ObjectId.isValid(request.getIdPresupuesto())) {
                throw new OptimizationException("El identificador del presupuesto no es válido");
            }
            presupuesto = presupuestoRepository.findById(new ObjectId(request.getIdPresupuesto()))
                    .orElseThrow(() -> new OptimizationException("Presupuesto no encontrado"));
            SecurityUtils.esMismoIdPerfilOAdmin(presupuesto.getIdPerfil());
            if (!idPeriodo.equals(presupuesto.getIdPeriodo())) {
                throw new OptimizationException("El presupuesto no corresponde al periodo seleccionado");
            }
        } else {
            presupuesto = presupuestoRepository.findByIdPerfilAndIdPeriodo(idPerfil, idPeriodo)
                    .orElseThrow(() -> new OptimizationException(
                            "Presupuesto no encontrado para el periodo seleccionado"));
        }

        if (!SecurityUtils.isAdmin() && !idPerfil.equals(presupuesto.getIdPerfil())) {
            throw new SecurityException("Acceso denegado: el presupuesto no pertenece al usuario autenticado");
        }
        return presupuesto;
    }

    private List<Necesidad> resolveNeeds(Presupuesto presupuesto, ObjectId idPeriodo) {
        Map<String, Necesidad> uniqueNeeds = new LinkedHashMap<>();
        List<Necesidad> candidates =
                necesidadRepository.findByIdPresupuestoAndIdPeriodo(presupuesto.getId(), idPeriodo);
        if (candidates == null) {
            return new ArrayList<>();
        }

        for (Necesidad need : candidates) {
            if (need == null || need.getId() == null
                    || !presupuesto.getId().equals(need.getIdPresupuesto())
                    || !idPeriodo.equals(need.getIdPeriodo())
                    || !presupuesto.getIdPerfil().equals(need.getIdPerfil())) {
                continue;
            }
            uniqueNeeds.putIfAbsent(need.getId().toHexString(), need);
        }
        return new ArrayList<>(uniqueNeeds.values());
    }

    private BigDecimal money(Double value) {
        return value == null || !Double.isFinite(value) ? null : BigDecimal.valueOf(value);
    }

    private BigDecimal roundPesos(BigDecimal value) {
        return value.setScale(0, RoundingMode.HALF_UP);
    }

    private Double asDouble(BigDecimal value) {
        return value.doubleValue();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }
        return "Necesidad";
    }

    private String format(BigDecimal value) {
        NumberFormat formatter = NumberFormat.getNumberInstance(Locale.forLanguageTag("es-CO"));
        formatter.setMaximumFractionDigits(2);
        formatter.setMinimumFractionDigits(0);
        return formatter.format(value);
    }
}
