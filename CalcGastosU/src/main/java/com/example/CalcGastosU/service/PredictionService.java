package com.example.CalcGastosU.service;

import org.springframework.stereotype.Service;
import weka.classifiers.Classifier;
import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.Instance;
import weka.core.Instances;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.text.Normalizer;
import java.util.*;

@Service
public class PredictionService {

    private final Classifier classifier;
    private final Instances dataStructure;

    public PredictionService() throws Exception {
        Classifier cls = (Classifier) weka.core.SerializationHelper.read(
                Objects.requireNonNull(getClass().getClassLoader().getResourceAsStream("model/modelo_prediccion_necesidad.model"))
        );
        this.classifier = cls;

        Instances ds = new Instances(
                new BufferedReader(
                        new InputStreamReader(
                                Objects.requireNonNull(getClass().getClassLoader().getResourceAsStream("model/prediccion_necesidad_500.arff"))
                        )
                )
        );
        ds.setClassIndex(ds.numAttributes() - 1);
        this.dataStructure = ds;
    }

    private String normalizarTexto(Object valor) {
        if (valor == null) return "";
        String txt = valor.toString().trim().toUpperCase();
        txt = Normalizer.normalize(txt, Normalizer.Form.NFD).replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        return txt;
    }

    public Map<String, Object> getStatus() {
        Map<String, Object> m = new HashMap<>();
        m.put("ready", classifier != null && dataStructure != null);
        m.put("classAttribute", dataStructure != null ? dataStructure.classAttribute().name() : null);
        m.put("numAttributes", dataStructure != null ? dataStructure.numAttributes() : 0);
        return m;
    }

    public Map<String, Object> getSchema() {
        List<Map<String, Object>> attrs = new ArrayList<>();
        for (int i = 0; i < dataStructure.numAttributes(); i++) {
            Attribute a = dataStructure.attribute(i);
            Map<String, Object> ai = new LinkedHashMap<>();
            ai.put("name", a.name());
            ai.put("isNumeric", a.isNumeric());
            ai.put("isClass", i == dataStructure.classIndex());
            if (a.isNominal()) {
                List<String> values = new ArrayList<>();
                for (int v = 0; v < a.numValues(); v++) values.add(a.value(v));
                ai.put("values", values);
            }
            attrs.add(ai);
        }
        Map<String, Object> s = new HashMap<>();
        s.put("attributes", attrs);
        s.put("classAttribute", dataStructure.classAttribute().name());
        return s;
    }

    public String predecir(Map<String, Object> valores) throws Exception {
        Instance instancia = new DenseInstance(dataStructure.numAttributes());
        instancia.setDataset(dataStructure);

        for (int i = 0; i < dataStructure.numAttributes() - 1; i++) {
            Attribute a = dataStructure.attribute(i);
            String nombre = a.name();
            Object v = valores.get(nombre);
            if (a.isNumeric()) {
                double num = 0.0;
                if (v != null) {
                    try { num = Double.parseDouble(v.toString()); } catch (Exception ignored) {}
                }
                instancia.setValue(i, num);
            } else {
                String valorNominal = normalizarTexto(v);
                int idx = a.indexOfValue(valorNominal);
                if (idx < 0) idx = 0;
                instancia.setValue(i, a.value(idx));
            }
        }

        double resultado = classifier.classifyInstance(instancia);
        return dataStructure.classAttribute().value((int) resultado);
    }
}