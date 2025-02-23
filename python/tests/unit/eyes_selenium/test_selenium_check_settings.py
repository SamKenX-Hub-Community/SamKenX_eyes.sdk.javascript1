import pytest
from appium.webdriver import WebElement as AppiumWebElement
from mock import MagicMock
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement as SeleniumWebElement

from applitools.common import FloatingBounds
from applitools.selenium import AccessibilityRegionType, Region, Target
from applitools.selenium.fluent import SeleniumCheckSettings
from applitools.selenium.fluent.target_path import TargetPath


def get_cs_from_method(method_name, *args, **kwargs):
    """
    Return initialized CheckSettings instance and invoked `method_name` with `args`

    Example ::

        cs = SeleniumCheckSettings().region(*args)
    """
    return getattr(SeleniumCheckSettings(), method_name)(*args, **kwargs)


def get_regions_from_(method_name, *args, **kwargs):
    """
        Return regions for invoked method from CheckSettings

    :param method_name: layout, ignore, strict or content
    """
    cs = get_cs_from_method(method_name, *args, **kwargs)
    regions = getattr(cs.values, "{}_regions".format(method_name))
    return regions


def test_default_check_settings():
    check_settings = SeleniumCheckSettings()

    assert check_settings.values.disable_browser_fetching is None
    assert check_settings.values.layout_breakpoints is None
    assert check_settings.values.lazy_load is None
    assert check_settings.values.wait_before_capture is None
    assert check_settings.values.page_id is None


def test_check_settings_change():
    check_settings = SeleniumCheckSettings()

    check_settings.wait_before_capture(10)
    check_settings.page_id("my-page")

    assert check_settings.values.wait_before_capture == 10
    assert check_settings.values.page_id == "my-page"


def test_check_region_and_frame_with_unsupported_input():
    with pytest.raises(TypeError):
        cs = get_cs_from_method("region", 12355)
    with pytest.raises(TypeError):
        cs = get_cs_from_method("frame", set())


@pytest.mark.parametrize("method_name", ["ignore", "layout", "strict", "content"])
def test_match_region_with_unsupported_input(method_name):
    with pytest.raises(TypeError):
        cs = get_cs_from_method(method_name, 1245)


def test_check_frame(method_name="frame"):
    frame_reference = "frame-name-or-id"
    cs = get_cs_from_method(method_name, frame_reference)
    assert cs.values.frame_chain[0].frame_name_or_id == frame_reference

    frame_selector = [By.ID, "some-selector"]
    cs = get_cs_from_method(method_name, frame_selector)
    assert cs.values.frame_chain[0].frame_locator == TargetPath.frame(
        By.ID, "some-selector"
    )

    frame_index = 3
    cs = get_cs_from_method(method_name, frame_index)
    assert cs.values.frame_chain[0].frame_index == frame_index


def test_check_region_with_region(method_name="region"):
    region = Region(0, 1, 2, 3)
    cs = get_cs_from_method(method_name, region)
    assert cs.values.target_region == region


def test_check_region_with_elements(method_name="region"):
    selenium_element = MagicMock(SeleniumWebElement)
    cs = get_cs_from_method(method_name, selenium_element)
    assert cs.values.target_locator == TargetPath.region(selenium_element)

    appium_element = MagicMock(AppiumWebElement)
    cs = get_cs_from_method(method_name, appium_element)
    assert cs.values.target_locator == TargetPath.region(appium_element)


@pytest.mark.parametrize(
    "by", [By.NAME, By.ID, By.CLASS_NAME, By.TAG_NAME, By.CSS_SELECTOR, By.XPATH]
)
def test_check_region_with_by_params(by, method_name="region"):
    value = "Selector"
    cs = get_cs_from_method(method_name, [by, value])
    assert cs.values.target_locator == TargetPath.region(by, value)

    cs = get_cs_from_method(method_name, TargetPath.region(by, value))
    assert cs.values.target_locator == TargetPath.region(by, value)


@pytest.mark.parametrize("method_name", ["ignore", "layout", "strict", "content"])
def test_match_regions_with_selectors_input(method_name):
    css_selector = ".cssSelector"
    regions = get_regions_from_(method_name, css_selector)
    assert regions[0]._target_path == TargetPath.region(css_selector)

    regions = get_regions_from_(method_name, TargetPath.region(css_selector))
    assert regions[0]._target_path == TargetPath.region(css_selector)

    locator = [By.XPATH, "locator"]
    regions = get_regions_from_(method_name, locator, css_selector)
    assert regions[0]._target_path == TargetPath.region(By.XPATH, "locator")
    assert regions[1]._target_path == TargetPath.region(By.CSS_SELECTOR, css_selector)


@pytest.mark.parametrize("method_name", ["ignore", "layout", "strict", "content"])
def test_match_regions_with_regions_input(method_name):
    region, region1 = Region(0, 1, 2, 3), Region(0, 2, 4, 5)
    regions = get_regions_from_(method_name, region)
    assert regions[0]._region == region

    regions = get_regions_from_(method_name, region, region1)
    assert regions[0]._region == region
    assert regions[1]._region == region1


@pytest.mark.parametrize("method_name", ["ignore", "layout", "strict", "content"])
def test_match_regions_with_elements(method_name):
    selenium_element = MagicMock(SeleniumWebElement)
    appium_element = MagicMock(AppiumWebElement)

    regions = get_regions_from_(method_name, selenium_element, appium_element)
    assert regions[0]._target_path == TargetPath.region(selenium_element)
    assert regions[1]._target_path == TargetPath.region(appium_element)


@pytest.mark.parametrize("method_name", ["ignore", "layout", "strict", "content"])
def test_match_regions_with_by_values(method_name):
    by_name = [By.NAME, "some-name"]
    by_id = [By.ID, "ident"]
    by_class = [By.CLASS_NAME, "class_name"]
    by_tag_name = [By.TAG_NAME, "tag_name"]
    by_css_selector = [By.CSS_SELECTOR, "css_selector"]
    by_xpath = [By.XPATH, "xpath"]

    regions = get_regions_from_(
        method_name, by_name, by_id, by_class, by_tag_name, by_css_selector, by_xpath
    )
    assert regions[0]._target_path == TargetPath.region(By.NAME, "some-name")
    assert regions[1]._target_path == TargetPath.region(By.ID, "ident")
    assert regions[2]._target_path == TargetPath.region(By.CLASS_NAME, "class_name")
    assert regions[3]._target_path == TargetPath.region(By.TAG_NAME, "tag_name")
    assert regions[4]._target_path == TargetPath.region(By.CSS_SELECTOR, "css_selector")
    assert regions[5]._target_path == TargetPath.region(By.XPATH, "xpath")


def test_match_floating_region():
    regions = get_regions_from_("floating", 5, [By.NAME, "name"])
    assert regions[0]._bounds == FloatingBounds(5, 5, 5, 5)
    assert regions[0]._target_path == TargetPath.region(By.NAME, "name")

    regions = get_regions_from_("floating", 5, "name")
    assert regions[0]._bounds == FloatingBounds(5, 5, 5, 5)
    assert regions[0]._target_path == TargetPath.region("name")

    regions = get_regions_from_("floating", 5, TargetPath.region("name"))
    assert regions[0]._bounds == FloatingBounds(5, 5, 5, 5)
    assert regions[0]._target_path == TargetPath.region("name")

    element = MagicMock(SeleniumWebElement)
    regions = get_regions_from_("floating", 5, element)
    assert regions[0]._bounds == FloatingBounds(5, 5, 5, 5)
    assert regions[0]._target_path == TargetPath.region(element)


def test_match_accessibility_region():
    regions = get_regions_from_(
        "accessibility", [By.NAME, "name"], AccessibilityRegionType.BoldText
    )
    assert regions[0]._type == AccessibilityRegionType.BoldText
    assert regions[0]._target_path == TargetPath.region(By.NAME, "name")

    regions = get_regions_from_(
        "accessibility", "name", AccessibilityRegionType.BoldText
    )
    assert regions[0]._type == AccessibilityRegionType.BoldText
    assert regions[0]._target_path == TargetPath.region(By.CSS_SELECTOR, "name")

    element = MagicMock(SeleniumWebElement)
    regions = get_regions_from_(
        "accessibility", element, AccessibilityRegionType.BoldText
    )
    assert regions[0]._type == AccessibilityRegionType.BoldText
    assert regions[0]._target_path == TargetPath.region(element)


def test_before_render_screenshot_hook():
    cs = SeleniumCheckSettings()
    cs.before_render_screenshot_hook("some hook")
    assert cs.values.script_hooks["beforeCaptureScreenshot"] == "some hook"


@pytest.mark.parametrize("method_name", ["ignore", "layout", "strict", "content"])
def test_region_padding_are_added(method_name):
    regions_selector = get_regions_from_(
        method_name, [By.NAME, "name"], padding={"top": 1, "left": 2}
    )

    assert regions_selector[0].padding == {"top": 1, "left": 2}


@pytest.mark.parametrize("method_name", ["ignore", "layout", "strict", "content"])
def test_region_region_id_added(method_name):
    regions_selector = get_regions_from_(
        method_name, [By.NAME, "name"], region_id="region_id"
    )

    assert regions_selector[0].region_id == "region_id"


def test_lazy_load_default_settings():
    cs = SeleniumCheckSettings()
    cs.lazy_load()

    assert cs.values.lazy_load is not None
    assert cs.values.lazy_load.scroll_length == None
    assert cs.values.lazy_load.waiting_time == None
    assert cs.values.lazy_load.max_amount_to_scroll == None


def test_lazy_load_custom_settings():
    cs = SeleniumCheckSettings()
    cs.lazy_load(scroll_length=1, waiting_time=2, max_amount_to_scroll=3)

    assert cs.values.lazy_load is not None
    assert cs.values.lazy_load.scroll_length == 1
    assert cs.values.lazy_load.waiting_time == 2
    assert cs.values.lazy_load.max_amount_to_scroll == 3


def test_webview_default():
    cs = SeleniumCheckSettings()
    cs.webview()

    assert cs.values.webview is True


def test_webview_false():
    cs = SeleniumCheckSettings()
    cs.webview(False)

    assert cs.values.webview is False


def test_webview_text():
    cs = SeleniumCheckSettings()
    cs.webview("webviewId")

    assert cs.values.webview == "webviewId"


def test_target_webview_default():
    cs = Target.webview()

    assert cs.values.webview is True


def test_target_webview_false():
    cs = Target.webview(False)

    assert cs.values.webview is False


def test_target_webview_id():
    cs = Target.webview("webviewId")

    assert cs.values.webview == "webviewId"
