package com.example.CalcGastosU.optimization.exception;

public class OptimizationException extends RuntimeException {
    private final boolean insufficientBudget;

    public OptimizationException(String message) {
        this(message, false);
    }

    public OptimizationException(String message, boolean insufficientBudget) {
        super(message);
        this.insufficientBudget = insufficientBudget;
    }

    public boolean isInsufficientBudget() {
        return insufficientBudget;
    }
}
