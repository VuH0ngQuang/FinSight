package com.finsight.marketrealtime.backtest;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Minimal CSV writer with UTF-8 BOM so Excel auto-detects Vietnamese text.
 * No external dependency. Thread-compatible (one instance per file).
 */
public class CsvWriter implements AutoCloseable {

    private final BufferedWriter out;
    private final int rowsBetweenFlush;
    private int rowCount;

    public CsvWriter(Path file) throws IOException {
        Files.createDirectories(file.getParent());
        OutputStream os = Files.newOutputStream(file);
        os.write(0xEF); os.write(0xBB); os.write(0xBF);            // UTF-8 BOM for Excel
        this.out = new BufferedWriter(new OutputStreamWriter(os, StandardCharsets.UTF_8));
        this.rowsBetweenFlush = 256;
    }

    public CsvWriter writeHeader(String... cols) throws IOException {
        return writeRow((Object[]) cols);
    }

    public CsvWriter writeRow(Object... cells) throws IOException {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < cells.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(escape(format(cells[i])));
        }
        sb.append('\n');
        out.write(sb.toString());
        if (++rowCount % rowsBetweenFlush == 0) out.flush();
        return this;
    }

    private static String format(Object v) {
        if (v == null) return "";
        if (v instanceof BigDecimal bd) return bd.toPlainString();
        if (v instanceof Double d)  return Double.isFinite(d) ? formatDouble(d) : "";
        if (v instanceof Float f)   return Float.isFinite(f)  ? formatDouble(f) : "";
        return v.toString();
    }

    private static String formatDouble(double d) {
        return BigDecimal.valueOf(d).setScale(6, RoundingMode.HALF_UP).toPlainString();
    }

    private static String escape(String s) {
        if (s == null) return "";
        boolean needsQuote = s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r");
        if (!needsQuote) return s;
        return "\"" + s.replace("\"", "\"\"") + "\"";
    }

    @Override
    public void close() throws IOException {
        out.flush();
        out.close();
    }
}
