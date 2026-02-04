package com.finsight.marketrealtime.utils;

/**
 * High-throughput, single-node ID generator that returns a 64-bit long.
 *
 * Characteristics:
 *  - Monotonically increasing within a single JVM.
 *  - Very high throughput: up to ~4.19M IDs per millisecond.
 *  - Simple layout: time (since custom epoch) + per-millisecond sequence.
 */
public final class IDGenerator {
    /**
     * Number of bits used to hold the per-millisecond sequence.
     * 22 bits -> max 4,194,303 IDs per millisecond.
     */
    private static final int SEQUENCE_BITS = 22;
    private static final long MAX_SEQUENCE = (1L << SEQUENCE_BITS) - 1;

    /**
     * Custom epoch (2025-01-01T00:00:00Z) to keep values smaller and extend range.
     */
    private static final long CUSTOM_EPOCH = 1735689600000L;

    private static long lastTimestamp = -1L;
    private static long sequence = 0L;

    private IDGenerator() {
        // no instances
    }

    /**
     * Generate the next unique ID.
     *
     * @return next ID as a long
     */
    public static synchronized long nextId() {
        long timestamp = currentTime();

        if (timestamp < lastTimestamp) {
            // Clock moved backwards; wait until time catches up
            timestamp = waitUntil(lastTimestamp);
        }

        if (timestamp == lastTimestamp) {
            sequence++;
            if (sequence > MAX_SEQUENCE) {
                // sequence overflow in this millisecond, wait for the next millisecond
                timestamp = waitUntil(lastTimestamp + 1);
                sequence = 0L;
            }
        } else {
            sequence = 0L;
        }

        lastTimestamp = timestamp;

        long timestampPart = (timestamp - CUSTOM_EPOCH) << SEQUENCE_BITS;
        long sequencePart = sequence;

        return timestampPart | sequencePart;
    }

    private static long currentTime() {
        return System.currentTimeMillis();
    }

    private static long waitUntil(long targetMillis) {
        long now = currentTime();
        while (now < targetMillis) {
            Thread.yield();
            now = currentTime();
        }
        return now;
    }
}
