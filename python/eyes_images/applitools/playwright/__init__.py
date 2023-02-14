from applitools.common import (
    DeviceName,
    FileLogger,
    MatchLevel,
    RectangleSize,
    Region,
    StdoutLogger,
    TestResultContainer,
    TestResults,
    TestResultsSummary,
    logger,
)
from applitools.common.accessibility import (  # noqa
    AccessibilityGuidelinesVersion,
    AccessibilityLevel,
    AccessibilityRegionType,
    AccessibilitySettings,
)
from applitools.common.config import BatchInfo  # noqa
from applitools.common.geometry import AccessibilityRegion
from applitools.common.selenium import BrowserType, Configuration, StitchMode  # noqa
from applitools.common.server import FailureReports  # noqa
from applitools.common.ultrafastgrid import (  # noqa
    ChromeEmulationInfo,
    DesktopBrowserInfo,
    IosDeviceInfo,
    IosDeviceName,
    IosVersion,
    ScreenOrientation,
)
from applitools.core.batch_close import BatchClose  # noqa
from applitools.core.cut import (  # noqa
    FixedCutProvider,
    NullCutProvider,
    UnscaledFixedCutProvider,
)
from applitools.core.extract_text import OCRRegion, TextRegionSettings
from applitools.core.fluent.region import AccessibilityRegionByRectangle  # noqa
from applitools.selenium.fluent.target import Target  # noqa
from applitools.selenium.fluent.target_path import TargetPath

from .eyes import Eyes
from .runner import ClassicRunner, RunnerOptions, VisualGridRunner

__all__ = (
    # noqa
    "BatchInfo",
    "Region",
    "MatchLevel",
    "logger",
    "StdoutLogger",
    "FileLogger",
    "Eyes",
    "Target",
    "TargetPath",
    "FailureReports",
    "StitchMode",
    "VisualGridRunner",
    "RunnerOptions",
    "BrowserType",
    "DeviceName",
    "Configuration",
    "ScreenOrientation",
    "FixedCutProvider",
    "NullCutProvider",
    "UnscaledFixedCutProvider",
    "ClassicRunner",
    "RectangleSize",
    "TestResults",
    "TestResultContainer",
    "TestResultsSummary",
    "BatchClose",
    "AccessibilityRegionType",
    "AccessibilityLevel",
    "AccessibilitySettings",
    "AccessibilityGuidelinesVersion",
    "AccessibilityRegionByRectangle",
    "AccessibilityRegion",
    "IosDeviceName",
    "IosDeviceInfo",
    "IosVersion",
    "ChromeEmulationInfo",
    "DesktopBrowserInfo",
    "OCRRegion",
    "TextRegionSettings",
)
