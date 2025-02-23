from os import path

import pytest
from PIL import Image, ImageDraw

from applitools.common import (
    AccessibilityGuidelinesVersion,
    AccessibilityLevel,
    AccessibilityRegionType,
    AccessibilitySettings,
    DiffsFoundError,
)
from applitools.core.extract_text import TextRegion
from applitools.images import (
    Eyes,
    OCRRegion,
    Region,
    Target,
    TextRegionSettings,
    UnscaledFixedCutProvider,
)
from tests.utils import get_session_results

here = path.abspath(path.dirname(__file__))


@pytest.fixture
def eyes():
    return Eyes()


def test_check_image(eyes):
    # type: (Eyes) -> None
    eyes.open("images", "TestCheckImage", dimension=dict(width=100, height=400))
    eyes.check_image(path.join(here, "resources/minions-800x500.jpg"))
    eyes.close()
    eyes.abort()


def test_check_image_abort(eyes):
    # type: (Eyes) -> None
    eyes.open("images", "TestCheckImageAbort", dimension=dict(width=100, height=400))
    eyes.check_image(path.join(here, "resources/minions-800x500.jpg"))
    eyes.abort()


def test_check_image_path_fluent(eyes):
    # type: (Eyes) -> None
    eyes.open("images", "TestCheckImage_Fluent")
    eyes.check(
        "TestCheckImage_Fluent",
        Target.image(path.join(here, "resources/minions-800x500.jpg")),
    )
    eyes.close()


def test_check_raw_image_fluent(eyes):
    # type: (Eyes) -> None
    eyes.open("images", "TestCheckImage_Fluent")
    origin_image = Image.open(path.join(here, "resources/minions-800x500.jpg"))
    eyes.check("TestCheckImage_Fluent", Target.image(origin_image))
    eyes.close()


def test_check_region(eyes):
    # type: (Eyes) -> None
    eyes.open("images", "TestCheckRegion")
    eyes.check_region(
        path.join(here, "resources/minions-800x500.jpg"),
        Region(left=200, top=100, width=400, height=400),
    )
    eyes.close()


def test_check_region_fluent(eyes):
    # type: (Eyes) -> None
    eyes.open("images", "TestCheckRegion_Fluent")
    eyes.check(
        Target.region(
            path.join(here, "resources/minions-800x500.jpg"),
            Region(left=200, top=100, width=400, height=400),
        )
    )
    eyes.close()


def test_check_raw_image_delete_result(eyes):
    # type: (Eyes) -> None
    eyes.open("images", "TestCheckImage_DeleteResult")
    origin_image = Image.new("RGBA", (600, 600))
    eyes.check("TestCheckImage_Fluent", Target.image(origin_image))
    result = eyes.close(False)
    result.delete()


def test_check_raw_image_fluent_must_fail(eyes):
    # type: (Eyes) -> None
    eyes.open("images", "TestCheckImage_Fluent")
    origin_image = Image.new("RGBA", (600, 600))
    draw = ImageDraw.Draw(origin_image)
    draw.rectangle(((0, 00), (500, 100)), fill="white")
    eyes.check("TestCheckImage_Fluent", Target.image(origin_image))
    with pytest.raises(DiffsFoundError):
        eyes.close()


def test_check_image_with_ignore_region_fluent(eyes):
    # type: (Eyes) -> None
    eyes.open("images", "TestCheckImageWithIgnoreRegion_Fluent")
    eyes.check(
        "TestCheckImage_WithIgnoreRegion_Fluent",
        Target.image(path.join(here, "resources/minions-800x500.jpg")).ignore(
            Region(10, 20, 30, 40)
        ),
    )
    eyes.close()


def test_check_image_fluent_cut_provider(eyes):
    # type: (Eyes) -> None
    eyes.open("images", "TestCheckImage_Fluent_CutProvider")
    eyes.cut_provider = UnscaledFixedCutProvider(200, 100, 100, 50)
    eyes.check(
        "TestCheckImage_Fluent",
        Target.image(path.join(here, "resources/minions-800x500.jpg")),
    )
    eyes.close()


def test_extract_text(eyes):
    # type: (Eyes) -> None
    eyes.open("images", "TestExtractText")
    result = eyes.extract_text(OCRRegion(path.join(here, "resources/extractText.png")))
    assert result == ["This is the navigation bar"]

    result = eyes.extract_text(
        OCRRegion(path.join(here, "resources/extractText.png"), Region(55, 11, 214, 18))
    )
    assert result == ["s the navigation bar"]
    eyes.close()


def test_extract_text_regions(eyes):
    # type: (Eyes) -> None
    eyes.open("images", "TestExtractTextRegions")
    result = eyes.locate_text(
        TextRegionSettings(".+").image(path.join(here, "resources/extractText.png"))
    )
    assert result[".+"] == [TextRegion(10, 11, 214, 18, "Thisisthenavigationbar")]

    eyes.close()


def test_check_image_fluent_accessibility(eyes):
    (
        eyes.configure.set_accessibility_validation(
            AccessibilitySettings(
                AccessibilityLevel.AA, AccessibilityGuidelinesVersion.WCAG_2_1
            )
        )
    )
    eyes.open("images", "TestCheckImage_Fluent_Accessibility")
    eyes.check(
        "TestCheckImage_Fluent",
        Target.image(path.join(here, "resources/minions-800x500.jpg")).accessibility(
            Region(10, 25, 200, 100), AccessibilityRegionType.GraphicalObject
        ),
    )
    test_result = eyes.close(False)

    session_results = get_session_results(eyes.api_key, test_result)

    ims = session_results["actualAppOutput"][0]["imageMatchSettings"]
    assert ims["accessibility"] == [
        {
            "type": "GraphicalObject",
            "isDisabled": False,
            "left": 10,
            "top": 25,
            "width": 200,
            "height": 100,
        }
    ]
    assert ims["accessibilitySettings"] == {"level": "AA", "version": "WCAG_2_1"}


def test_check_image_with_viewport_size_set(eyes):
    eyes.open(
        "images",
        "TestCheckImageWithViewportSizeSet",
        dimension=dict(width=100, height=400),
    )
    eyes.check_image(path.join(here, "resources/minions-800x500.jpg"))
    result = eyes.close()
    assert result.host_display_size.width == 100
    assert result.host_display_size.height == 400


@pytest.mark.skip("Not supported by core-universal yet")
def test_check_image_without_viewport_size_set(eyes):
    eyes.open(
        "images",
        "TestCheckImageWithoutViewportSizeSet",
    )
    eyes.check_image(path.join(here, "resources/minions-800x500.jpg"))
    result = eyes.close()
    assert result.host_display_size.width == 800
    assert result.host_display_size.height == 500
