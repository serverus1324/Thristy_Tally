package com.example.CalcGastosU.service;

import weka.classifiers.Classifier;
import weka.classifiers.trees.J48;
import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.Instances;
import weka.core.SerializationHelper;
import weka.core.converters.ArffLoader;
import weka.core.converters.ArffSaver;
import weka.core.converters.CSVLoader;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Service
public class PredictionService {

    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
    private Classifier classifier; // J48
    private Instances header; // dataset header for building instances
    private String modelPath = "models/j48.model"; // fallback en disco
    private String headerPath = "models/j48-header.arff"; // fallback en disco
    private final String modelResourcePath = "model/modelo_prediccion_necesidad_j48.model"; // classpath
    private final String headerResourcePath = "model/header_prediccion_necesidad.arff"; // classpath opcional

    @PostConstruct
    public void init() {
        // Intentar cargar modelo y header desde resources
        tryLoadModelFromResources();
        // Si no se pudo, intentar cargar desde disco
        if (!isReady()) {
            tryLoadModelFromDisk();
        }
    }

    public Map<String, Object> trainFromFile(MultipartFile file, String classAttr, Integer classIndex) throws IOException {
        lock.writeLock().lock();
        try {
            Instances data = loadInstances(file);
            if (data == null) {
                throw new IOException("No se pudo cargar el dataset");
            }

            if (classAttr != null && !classAttr.isBlank()) {
                Attribute cls = data.attribute(classAttr);
                if (cls == null) {
                    throw new IllegalArgumentException("El atributo de clase '" + classAttr + "' no existe en el dataset");
                }
                data.setClass(cls);
            } else if (classIndex != null && classIndex >= 0 && classIndex < data.numAttributes()) {
                data.setClassIndex(classIndex);
            } else {
                data.setClassIndex(data.numAttributes() - 1);
            }

            J48 tree = new J48();
            tree.setUnpruned(false);
            try {
                tree.buildClassifier(data);
            } catch (Exception e) {
                throw new IOException("Error entrenando J48: " + e.getMessage(), e);
            }

            this.classifier = tree;
            this.header = new Instances(data, 0);
            this.header.setClassIndex(data.classIndex());

            // Persist model to disk
            Path modelDir = Paths.get("models");
            if (!Files.exists(modelDir)) {
                Files.createDirectories(modelDir);
            }
            try {
                SerializationHelper.write(modelPath, classifier);
            } catch (Exception e) {
                throw new IOException("Error guardando el modelo J48: " + e.getMessage(), e);
            }

            // Guardar header ARFF para futuras cargas
            try {
                ArffSaver saver = new ArffSaver();
                saver.setInstances(this.header);
                File out = new File(headerPath);
                saver.setFile(out);
                saver.writeBatch();
            } catch (Exception e) {
                // No rompemos si falla guardar header, pero lo registramos
                System.err.println("No se pudo guardar header ARFF: " + e.getMessage());
            }

            Map<String, Object> info = new HashMap<>();
            info.put("numAttributes", data.numAttributes());
            info.put("numInstances", data.numInstances());
            info.put("classAttribute", data.classAttribute().name());
            info.put("status", "modelo entrenado");
            return info;
        } finally {
            lock.writeLock().unlock();
        }
    }

    private void tryLoadModelFromResources() {
        lock.writeLock().lock();
        try {
            // Intentar múltiples nombres posibles de modelo en resources
            String[] modelCandidates = new String[] {
                modelResourcePath,
                "model/modelo_prediccion_necesidad_j48.model .model",
                "model/j48.model"
            };
            for (String mc : modelCandidates) {
                try {
                    ClassPathResource modelRes = new ClassPathResource(mc);
                    if (modelRes.exists()) {
                        Object obj = SerializationHelper.read(modelRes.getInputStream());
                        if (obj instanceof Classifier) {
                            classifier = (Classifier) obj;
                            break;
                        }
                    }
                } catch (Exception ignored) {
                }
            }
            // Intentar múltiples nombres de header ARFF publicados por el usuario
            String[] candidates = new String[] {
                headerResourcePath,
                "model/prediccion_necesidad_500.arff",
                "model/prediccion_necesidad.arff"
            };
            for (String candidate : candidates) {
                try {
                    ClassPathResource headerRes = new ClassPathResource(candidate);
                    if (headerRes.exists()) {
                        ArffLoader loader = new ArffLoader();
                        loader.setSource(headerRes.getInputStream());
                        Instances headerData = loader.getDataSet();
                        header = new Instances(headerData, 0);
                        header.setClassIndex(headerData.classIndex() >= 0 ? headerData.classIndex() : headerData.numAttributes() - 1);
                        break;
                    }
                } catch (Exception ignored) {
                }
            }
        } finally {
            lock.writeLock().unlock();
        }
    }

    public Map<String, Object> schema() {
        lock.readLock().lock();
        try {
            Map<String, Object> res = new HashMap<>();
            if (header == null) {
                res.put("ready", false);
                res.put("attributes", new HashMap<>());
                return res;
            }
            res.put("ready", isReady());
            res.put("classAttribute", header.classAttribute().name());
            res.put("classIndex", header.classIndex());
            Map<String, Object>[] attrs = new HashMap[header.numAttributes()];
            for (int i = 0; i < header.numAttributes(); i++) {
                Attribute a = header.attribute(i);
                Map<String, Object> ainfo = new HashMap<>();
                ainfo.put("name", a.name());
                ainfo.put("index", i);
                ainfo.put("isClass", i == header.classIndex());
                ainfo.put("type", a.isNumeric() ? "numeric" : (a.isNominal() ? "nominal" : "other"));
                if (a.isNominal()) {
                    String[] values = new String[a.numValues()];
                    for (int v = 0; v < a.numValues(); v++) {
                        values[v] = a.value(v);
                    }
                    ainfo.put("values", values);
                }
                attrs[i] = ainfo;
            }
            res.put("attributes", attrs);
            return res;
        } finally {
            lock.readLock().unlock();
        }
    }

    public boolean isReady() {
        lock.readLock().lock();
        try {
            return classifier != null && header != null && header.classIndex() >= 0;
        } finally {
            lock.readLock().unlock();
        }
    }

    public Map<String, Object> status() {
        lock.readLock().lock();
        try {
            Map<String, Object> s = new HashMap<>();
            s.put("ready", isReady());
            s.put("classAttribute", header != null && header.classAttribute() != null ? header.classAttribute().name() : null);
            s.put("numAttributes", header != null ? header.numAttributes() : 0);
            return s;
        } finally {
            lock.readLock().unlock();
        }
    }

    public Map<String, Object> predict(Map<String, Object> features) throws IOException {
        lock.readLock().lock();
        try {
            if (!isReady()) {
                // intentar cargar modelo si existe
                tryLoadModelFromDisk();
            }
            if (!isReady()) {
                throw new IllegalStateException("Modelo no entrenado. Cargue un dataset y entrene primero.");
            }

            DenseInstance inst = new DenseInstance(header.numAttributes());
            inst.setDataset(header);

            for (int i = 0; i < header.numAttributes(); i++) {
                Attribute att = header.attribute(i);
                if (i == header.classIndex()) {
                    inst.setMissing(att);
                    continue;
                }
                Object v = features.get(att.name());
                if (v == null) {
                    inst.setMissing(att);
                    continue;
                }
                try {
                    if (att.isNumeric()) {
                        double d = parseDouble(v);
                        inst.setValue(att, d);
                    } else if (att.isNominal()) {
                        String sv = String.valueOf(v);
                        int idx = att.indexOfValue(sv);
                        if (idx >= 0) {
                            inst.setValue(att, idx);
                        } else {
                            inst.setMissing(att);
                        }
                    } else {
                        // otros tipos: marcar como missing
                        inst.setMissing(att);
                    }
                } catch (Exception ex) {
                    inst.setMissing(att);
                }
            }

            double predIndex;
            double[] dist;
            try {
                predIndex = classifier.classifyInstance(inst);
                dist = classifier.distributionForInstance(inst);
            } catch (Exception e) {
                throw new IOException("Error clasificando instancia: " + e.getMessage(), e);
            }

            String predLabel = header.classAttribute().value((int) predIndex);
            Map<String, Double> distribution = new HashMap<>();
            Attribute cls = header.classAttribute();
            for (int i = 0; i < cls.numValues(); i++) {
                distribution.put(cls.value(i), dist[i]);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("predictedLabel", predLabel);
            result.put("predictedIndex", (int) predIndex);
            result.put("distribution", distribution);
            result.put("classAttribute", cls.name());
            return result;
        } finally {
            lock.readLock().unlock();
        }
    }

    private Instances loadInstances(MultipartFile file) throws IOException {
        String name = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (name.endsWith(".arff")) {
            ArffLoader loader = new ArffLoader();
            loader.setSource(file.getInputStream());
            try {
                return loader.getDataSet();
            } catch (IOException e) {
                throw e;
            }
        } else if (name.endsWith(".csv")) {
            CSVLoader loader = new CSVLoader();
            loader.setSource(file.getInputStream());
            try {
                return loader.getDataSet();
            } catch (IOException e) {
                throw e;
            }
        } else {
            // intentar ARFF por defecto
            ArffLoader loader = new ArffLoader();
            loader.setSource(file.getInputStream());
            return loader.getDataSet();
        }
    }

    private void tryLoadModelFromDisk() {
        lock.writeLock().lock();
        try {
            File f = new File(modelPath);
            if (!f.exists()) return;
            try {
                Object obj = SerializationHelper.read(modelPath);
                if (obj instanceof Classifier) {
                    classifier = (Classifier) obj;
                }
            } catch (Exception ignored) {
            }
            // intentar cargar header
            try {
                File h = new File(headerPath);
                if (h.exists()) {
                    ArffLoader loader = new ArffLoader();
                    loader.setSource(h);
                    Instances headerData = loader.getDataSet();
                    header = new Instances(headerData, 0);
                    header.setClassIndex(headerData.classIndex() >= 0 ? headerData.classIndex() : headerData.numAttributes() - 1);
                }
            } catch (Exception ignored) {
            }
        } finally {
            lock.writeLock().unlock();
        }
    }

    private double parseDouble(Object v) {
        if (v instanceof Number) return ((Number) v).doubleValue();
        String s = String.valueOf(v);
        return Double.parseDouble(s);
    }
}