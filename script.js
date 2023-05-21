async function getRandomPokemon(numPokemonPairs) {
  const randomPokemon = new Set();
  const shuffledPokemon = [];

  while (randomPokemon.size < numPokemonPairs) {
    const randomPokemonID = Math.floor(Math.random() * 810) + 1;
    randomPokemon.add(randomPokemonID);
    shuffledPokemon.push(randomPokemonID, randomPokemonID);
  }
  shuffledPokemon.sort(() => Math.random() - 0.5);

  let cardsHtml = "";
  for (let i = 0; i < shuffledPokemon.length; i++) {
    const pokemonID = shuffledPokemon[i];
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonID}`);
    const data = await res.json();
    cardsHtml += `
            <div class="pokeCard">
                <img id="img${i}" class="front_face" src=${data.sprites.other["official-artwork"].front_default} alt="">
                <img class="back_face" src="back.webp" alt="">
            </div>
        `;
  }
  $("#gameGrid").append(cardsHtml);
}

const setup = () => {
  $("#start").hide();
  $("#reset").hide();

  $("#reset").click(function () {
    location.reload();
    $("#difficulty").val("");
  });

  var darkModeText = $(".theme-switch-wrapper p").last();
  var lightModeText = $(".theme-switch-wrapper p").first();
  var darkModeImg = $("#img-dark");
  var lightModeImg = $("#img-light");

  darkModeImg.hide();
  lightModeText.show();
  darkModeText.hide();

  $("#checkbox").change(function () {
    if ($(this).is(":checked")) {
      $("body").css("background-color", "black");
      $(".dashboard").css("color", "white");
      $(".dashboard").css("border", "1px solid white");

      lightModeText.hide();
      lightModeImg.hide();
      darkModeText.show();
      darkModeImg.show();
    } else {
      $("body").css("background-color", "white");
      $(".dashboard").css("color", "black");
      $(".dashboard").css("border", "1px solid black");

      lightModeText.show();
      lightModeImg.show();
      darkModeText.hide();
      darkModeImg.hide();
    }
  });

  var difficulty = "";

  $("#difficulty").change(function () {
    difficulty = $(this).val();
    localStorage.setItem("selectedDifficulty", difficulty);
    if (difficulty) {
      $("#start").show();
      $("#reset").show();
    }
  });

  function startGame() {
    $("#start").css("display", "none");
    $("#info").css("display", "");

    var firstCard = undefined;
    var secondCard = undefined;
    var totalPairs = 0;
    var matches = 0;
    var clicks = 0;
    var moves = 0;
    var matchesLeft = totalPairs;
    var timer = 0;
    var finalTime = 0;

    switch (difficulty) {
      case "easy":
        totalPairs = 3;
        timer = 30;
        $("#gameGrid").css("width", "300px");
        $("#gameGrid").css("height", "200px");
        break;
      case "normal":
        totalPairs = 6;
        timer = 60;
        $("#gameGrid").css("width", "400px");
        $("#gameGrid").css("height", "300px");
        break;
      default:
        totalPairs = 12;
        timer = 120;
        $("#gameGrid").css("width", "600px");
        $("#gameGrid").css("height", "400px");
    }
    matchesLeft = totalPairs;

    $("#moves").text(moves);
    $("#total").text(totalPairs);
    $("#matches").text(matches);
    $("#left").text(matchesLeft - matches);
    $("#timer").text(timer);
    $("#time").text(timer);

    let $clicks = $("#clicks");
    let $moves = $("#moves");
    let $matches = $("#matches");
    let $left = $("#left");
    let $finalMoves = $("#final-moves");
    let $finalTime = $("#final-time");

    let timerInterval = setInterval(() => {
      timer--;
      finalTime++;
      $("#time").text(timer);

      if (timer === 0) {
        clearInterval(timerInterval);
        $(".dialog-timeout").show();
        return;
      }
    }, 1000);

    getRandomPokemon(totalPairs).then(() => {
      $("#powerUp").one("click", function () {
        $(this).prop("disabled", true);
        $(".pokeCard").addClass("flip disabled");

        setTimeout(() => {
          $(".pokeCard").each(function () {
            if (!$(this).hasClass("matched")) {
              $(this).removeClass("flip disabled");
            }
          });
        }, 1500);
      });

      $("#gameGrid").on("click", ".pokeCard", function () {
        if (
          $(this).hasClass("flip") ||
          $(this).hasClass("matched") ||
          (firstCard && secondCard)
        ) {
          return;
        }

        if (!firstCard) {
          firstCard = $(this).find(".front_face")[0];
          $(this).toggleClass("flip");
          $(this).toggleClass("disabled");
          clicks++;
          $clicks.text(clicks);
        } else {
          if ($(this).find(".front_face")[0] === firstCard) {
            return;
          }
          if (!secondCard) {
            secondCard = $(this).find(".front_face")[0];
            $(this).toggleClass("flip");
            $(this).toggleClass("disabled");
            clicks++;
            $clicks.text(clicks);
            moves++;
            $moves.text(moves);
          } else {
            return;
          }

          if (firstCard.src == secondCard.src) {
            matches++;
            $matches.text(matches);
            $left.text(matchesLeft - matches);

            $(`#${firstCard.id}`).parent().addClass("matched");
            $(`#${secondCard.id}`).parent().addClass("matched");

            $(`#${firstCard.id}`).parent().off("click");
            $(`#${secondCard.id}`).parent().off("click");

            firstCard = undefined;
            secondCard = undefined;
          } else {
            setTimeout(() => {
              $(`#${firstCard.id}`).parent().toggleClass("flip");
              $(`#${firstCard.id}`).parent().toggleClass("disabled");
              $(`#${secondCard.id}`).parent().toggleClass("flip");
              $(`#${secondCard.id}`).parent().toggleClass("disabled");

              firstCard = undefined;
              secondCard = undefined;
            }, 1000);
          }
        }

        if (matches === totalPairs) {
          setTimeout(() => {
            $finalMoves.text(moves);
            $finalTime.text(finalTime);
            $(".dialog").show();
            clearInterval(timerInterval);
          }, 1000);
        }
      });
    });
  }
  $("#start").click(function () {
    startGame();
  });
};

$(document).ready(function () {
  var storedDifficulty = localStorage.getItem("selectedDifficulty");

  if (storedDifficulty) {
    $("#difficulty").val("");
  }

  $("#checkbox").prop("checked", false);

  setup();
});
