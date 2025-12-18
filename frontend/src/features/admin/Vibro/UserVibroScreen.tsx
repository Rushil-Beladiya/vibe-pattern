import { sendRequest } from "@/src/lib/api";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { PatternSelector } from "./component/PatternSelector";
import { VibrationPlayer } from "./component/VibrationPlayer";
import { ActionButtons } from "./component/ActionButtons";
import { PatternGridModal } from "./component/PatternGridModal";
import { SpeedControls } from "./component/SpeedControls";

type Pattern = {
  id?: number | string;
  name: string;
  pattern: number[];
  icon?: string;
  premium?: boolean;
  intensityValues?: number[];
};

// Default fallback pattern
const DEFAULT_PATTERN: Pattern = {
  id: 0,
  name: "Default Pattern",
  pattern: [100, 200, 100, 300, 150],
  icon: "📊",
  intensityValues: [0, 100, 200, 100, 300],
};

export default function UserVibroScreen() {
  const [patterns, setPatterns] = useState<Pattern[]>([DEFAULT_PATTERN]);
  const [loading, setLoading] = useState(true);
  const [selIdx, setSelIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [showList, setShowList] = useState(false);

  const selPat = patterns[selIdx] ?? patterns[0];

  useEffect(() => {
    // fetch submission (example id 8) and convert to pattern shape
    fetchUserVibro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserVibro = async () => {
    try {
      setLoading(true);
      const res = await sendRequest({
        url: `user/submissions/8`,
        method: "get",
      });
      const payload = res?.data ?? res;
      const submission = payload?.data ?? payload;

      console.log("Fetched submission:", submission);

      if (!submission) {
        setLoading(false);
        return;
      }

      const sd = submission.submitted_data ?? [];

      // Try to find a nested vibration pattern object first
      const vibField = sd.find((f: any) => f.key === "vibration_pattern");

      let patternObj: Pattern | null = null;

      if (vibField) {
        const val =
          typeof vibField.value === "string"
            ? tryParseJson(vibField.value)
            : vibField.value;
        if (val && Array.isArray(val.pattern_ms)) {
          patternObj = {
            id: submission.id,
            name:
              val.name ||
              getFieldValue(sd, "pattern_name") ||
              submission.form?.name ||
              "Pattern",
            pattern: val.pattern_ms,
            icon: val.icon || "📊",
            intensityValues: val.intensity_values ?? [],
          };
        }
      }

      // Fallback: try to build pattern from separate fields
      if (!patternObj) {
        const pms =
          getFieldValue(sd, "pattern_ms") ||
          getFieldValue(sd, "pattern") ||
          null;
        const iv =
          getFieldValue(sd, "intensity_values") ||
          getFieldValue(sd, "intensity") ||
          null;
        if (Array.isArray(pms)) {
          patternObj = {
            id: submission.id,
            name:
              getFieldValue(sd, "pattern_name") ||
              submission.form?.name ||
              "Pattern",
            pattern: pms,
            icon: "📊",
            intensityValues: Array.isArray(iv) ? iv : [],
          };
        }
      }

      // Final fallback: create pattern from submitted data
      if (!patternObj) {
        const patternName =
          getFieldValue(sd, "pattern_name") || "Custom Pattern";
        patternObj = {
          id: submission.id,
          name: patternName,
          pattern: [100, 200, 100, 300, 150], // default pattern
          icon: "📊",
          intensityValues: [0, 100, 200, 100, 300],
        };
      }

      if (patternObj) {
        setPatterns([patternObj]);
      }
    } catch (error) {
      console.error("Error fetching vibro data:", error);
    } finally {
      setLoading(false);
    }
  };

  const tryParseJson = (s: any) => {
    try {
      return typeof s === "string" ? JSON.parse(s) : s;
    } catch (_) {
      return null;
    }
  };

  const getFieldValue = (arr: any[], key: string) => {
    const f = arr.find((i) => i.key === key);
    return f
      ? typeof f.value === "string" && looksLikeJson(f.value)
        ? tryParseJson(f.value)
        : f.value
      : null;
  };

  const looksLikeJson = (s: string) => {
    return (
      typeof s === "string" &&
      (s.trim().startsWith("{") || s.trim().startsWith("["))
    );
  };

  const toggle = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  const changeSpeed = useCallback(
    (s: number) => {
      const was = playing;
      if (playing) setPlaying(false);
      setSpeed(s);
      if (was) setTimeout(() => setPlaying(true), 50);
    },
    [playing]
  );

  const openList = useCallback(() => setShowList(true), []);
  const closeList = useCallback(() => setShowList(false), []);

  const selectPat = useCallback(
    (i: number) => {
      if (playing) setPlaying(false);
      setSelIdx(i);
    },
    [playing]
  );

  const selectFromGrid = useCallback(
    (i: number) => {
      if (playing) setPlaying(false);
      setSelIdx(i);
      closeList();
    },
    [playing, closeList]
  );

  if (loading) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <ActivityIndicator size="large" color="#a855f7" />
        <Text style={styles.loadingText}>Loading vibration data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <PatternSelector
        patterns={patterns}
        selectedIndex={selIdx}
        onSelectPattern={selectPat}
      />
      <VibrationPlayer
        pattern={selPat}
        playing={playing}
        speed={speed}
        onToggle={toggle}
      />
      <ActionButtons onOpenList={openList} />
      <SpeedControls speed={speed} onChangeSpeed={changeSpeed} />
      <PatternGridModal
        visible={showList}
        patterns={patterns}
        selectedIndex={selIdx}
        onClose={closeList}
        onSelectPattern={selectFromGrid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fafafa" },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#a855f7",
    fontWeight: "500",
  },
});
