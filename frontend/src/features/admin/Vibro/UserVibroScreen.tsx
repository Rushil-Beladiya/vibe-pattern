import { sendRequest } from "@/src/lib/api";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
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

// Helper: attempt to parse JSON strings
const tryParseJson = (s: any) => {
  try {
    return typeof s === "string" ? JSON.parse(s) : s;
  } catch (_) {
    return null;
  }
};

const looksLikeJson = (s: any) =>
  typeof s === "string" &&
  (s.trim().startsWith("{") || s.trim().startsWith("["));

const getFieldValue = (arr: any[] = [], key: string) => {
  const f = arr.find((i) => i.key === key);
  if (!f) return null;
  return typeof f.value === "string" && looksLikeJson(f.value)
    ? tryParseJson(f.value)
    : f.value;
};

export default function UserVibroScreen() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [selIdx, setSelIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [showList, setShowList] = useState(false);

  const selPat = useMemo(
    () =>
      patterns[selIdx] ??
      patterns[0] ?? {
        id: undefined,
        name: "No Pattern",
        pattern: [],
        icon: "📊",
        intensityValues: [],
      },
    [patterns, selIdx]
  );

  useLayoutEffect(() => {
    fetchUserVibro();
  }, []);

  const fetchUserVibro = async () => {
    try {
      setLoading(true);
      const res = await sendRequest({
        url: `user/submissions?screen_id=2`,
        method: "get",
      });
      const payload = res?.data ?? res;
      const submission = payload?.data ?? payload;

      console.log("Fetched submission(s):", submission);

      if (!submission) {
        setLoading(false);
        return;
      }

      // Normalize to an array of submissions
      const submissionsArray = Array.isArray(submission)
        ? submission
        : [submission];

      const patternsFromSubs = submissionsArray
        .map((s: any) => {
          const sd = s.submitted_data ?? [];
          const vibField = sd.find((f: any) => f.key === "vibration_pattern");

          if (vibField) {
            const val =
              typeof vibField.value === "string"
                ? tryParseJson(vibField.value)
                : vibField.value;
            if (val && Array.isArray(val.pattern_ms)) {
              return {
                id: s.id,
                name:
                  val.name ||
                  getFieldValue(sd, "pattern_name") ||
                  s.form?.name ||
                  s.submission_number ||
                  "Pattern",
                pattern: val.pattern_ms,
                icon: val.icon || "📊",
                intensityValues: Array.isArray(val.intensity_values)
                  ? val.intensity_values
                  : [],
              } as Pattern;
            }
          }

          const pms =
            getFieldValue(sd, "pattern_ms") ||
            getFieldValue(sd, "pattern") ||
            null;
          const iv =
            getFieldValue(sd, "intensity_values") ||
            getFieldValue(sd, "intensity") ||
            null;
          if (Array.isArray(pms)) {
            return {
              id: s.id,
              name:
                getFieldValue(sd, "pattern_name") ||
                s.form?.name ||
                s.submission_number ||
                "Pattern",
              pattern: pms,
              icon: "📊",
              intensityValues: Array.isArray(iv) ? iv : [],
            } as Pattern;
          }

          // no pattern data found — return a minimal record (empty pattern)
          return {
            id: s.id,
            name:
              getFieldValue(sd, "pattern_name") ||
              s.submission_number ||
              "Custom Pattern",
            pattern: [],
            icon: "📊",
            intensityValues: [],
          } as Pattern;
        })
        .filter(Boolean) as Pattern[];

      if (patternsFromSubs.length > 0) {
        setPatterns(patternsFromSubs);
        setSelIdx(0);
      }
    } catch (error) {
      console.error("Error fetching vibro data:", error);
    } finally {
      setLoading(false);
    }
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
