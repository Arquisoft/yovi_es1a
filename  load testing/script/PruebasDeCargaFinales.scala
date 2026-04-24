package yovi

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class PruebasDeCargaFinales extends Simulation {

  private val httpProtocol = http
    .baseUrl("https://localhost")
    .acceptHeader("*/*")
    .acceptEncodingHeader("gzip, deflate, br")
    .acceptLanguageHeader("es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7")
    .userAgentHeader("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0")
  
  private val headers_2 = Map(
  		"Sec-Fetch-Dest" -> "empty",
  		"Sec-Fetch-Mode" -> "cors",
  		"Sec-Fetch-Site" -> "same-origin"
  )
  
  private val headers_3 = Map(
  		"Content-type" -> "text/plain;charset=UTF-8",
  		"Origin" -> "https://localhost",
  		"Sec-Fetch-Dest" -> "empty",
  		"Sec-Fetch-Mode" -> "cors",
  		"Sec-Fetch-Site" -> "same-origin"
  )
  
  private val headers_5 = Map(
  		"Priority" -> "u=4",
  		"Sec-Fetch-Dest" -> "empty",
  		"Sec-Fetch-Mode" -> "no-cors",
  		"Sec-Fetch-Site" -> "none",
  		"content-type" -> "message/ohttp-req"
  )
  
  private val headers_6 = Map(
  		"Content-Type" -> "application/json",
  		"Origin" -> "https://localhost",
  		"Priority" -> "u=0",
  		"Sec-Fetch-Dest" -> "empty",
  		"Sec-Fetch-Mode" -> "cors",
  		"Sec-Fetch-Site" -> "same-origin"
  )
  
  private val headers_9 = Map(
  		"Content-Type" -> "application/json",
  		"Origin" -> "https://localhost",
  		"Priority" -> "u=0",
  		"Sec-Fetch-Dest" -> "empty",
  		"Sec-Fetch-Mode" -> "cors",
  		"Sec-Fetch-Site" -> "same-origin",
  		"authorization" -> "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWU3ZWNkOGM4YjEzNzBkNDAwZTJiMTciLCJ1c2VybmFtZSI6InJhaW1hbjEyMyIsImlhdCI6MTc3Njk1ODk5OCwiZXhwIjoxNzc2OTYyNTk4fQ.pJ_PYG4CbR01vLNtekL1N6-v-3qKQLKL2SeZVCynFTk"
  )
  
  private val headers_10 = Map(
  		"Content-Type" -> "application/json",
  		"Origin" -> "https://localhost",
  		"Priority" -> "u=4",
  		"Sec-Fetch-Dest" -> "empty",
  		"Sec-Fetch-Mode" -> "cors",
  		"Sec-Fetch-Site" -> "same-origin",
  		"authorization" -> "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWU3ZWNkOGM4YjEzNzBkNDAwZTJiMTciLCJ1c2VybmFtZSI6InJhaW1hbjEyMyIsImlhdCI6MTc3Njk1ODk5OCwiZXhwIjoxNzc2OTYyNTk4fQ.pJ_PYG4CbR01vLNtekL1N6-v-3qKQLKL2SeZVCynFTk"
  )
  
  private val headers_23 = Map(
  		"Content-Type" -> "application/json",
  		"Priority" -> "u=4",
  		"Sec-Fetch-Dest" -> "empty",
  		"Sec-Fetch-Mode" -> "cors",
  		"Sec-Fetch-Site" -> "same-origin",
  		"authorization" -> "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWU3ZWNkOGM4YjEzNzBkNDAwZTJiMTciLCJ1c2VybmFtZSI6InJhaW1hbjEyMyIsImlhdCI6MTc3Njk1ODk5OCwiZXhwIjoxNzc2OTYyNTk4fQ.pJ_PYG4CbR01vLNtekL1N6-v-3qKQLKL2SeZVCynFTk"
  )
  
  private val headers_24 = Map(
  		"Content-Type" -> "application/json",
  		"If-None-Match" -> """W/"e8-0RDTalsLncNosyoMXlAqqy7YU7E"""",
  		"Priority" -> "u=4",
  		"Sec-Fetch-Dest" -> "empty",
  		"Sec-Fetch-Mode" -> "cors",
  		"Sec-Fetch-Site" -> "same-origin",
  		"authorization" -> "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWU3ZWNkOGM4YjEzNzBkNDAwZTJiMTciLCJ1c2VybmFtZSI6InJhaW1hbjEyMyIsImlhdCI6MTc3Njk1ODk5OCwiZXhwIjoxNzc2OTYyNTk4fQ.pJ_PYG4CbR01vLNtekL1N6-v-3qKQLKL2SeZVCynFTk"
  )
  
  private val headers_27 = Map(
  		"Content-Type" -> "application/json",
  		"If-None-Match" -> """W/"65-5sEvJneR4uX01C9dtbusVm7FgUE"""",
  		"Priority" -> "u=4",
  		"Sec-Fetch-Dest" -> "empty",
  		"Sec-Fetch-Mode" -> "cors",
  		"Sec-Fetch-Site" -> "same-origin",
  		"authorization" -> "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWU3ZWNkOGM4YjEzNzBkNDAwZTJiMTciLCJ1c2VybmFtZSI6InJhaW1hbjEyMyIsImlhdCI6MTc3Njk1ODk5OCwiZXhwIjoxNzc2OTYyNTk4fQ.pJ_PYG4CbR01vLNtekL1N6-v-3qKQLKL2SeZVCynFTk"
  )
  
  private val headers_28 = Map(
  		"Content-Type" -> "application/json",
  		"If-None-Match" -> """W/"4c-D8K3vimZDBafKqu9Bqv7MMbJ7mU"""",
  		"Priority" -> "u=4",
  		"Sec-Fetch-Dest" -> "empty",
  		"Sec-Fetch-Mode" -> "cors",
  		"Sec-Fetch-Site" -> "same-origin",
  		"authorization" -> "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWU3ZWNkOGM4YjEzNzBkNDAwZTJiMTciLCJ1c2VybmFtZSI6InJhaW1hbjEyMyIsImlhdCI6MTc3Njk1ODk5OCwiZXhwIjoxNzc2OTYyNTk4fQ.pJ_PYG4CbR01vLNtekL1N6-v-3qKQLKL2SeZVCynFTk"
  )
  
  private val headers_29 = Map(
  		"Content-Type" -> "application/json",
  		"If-None-Match" -> """W/"5f0-D+kU86bMTGZzqkzgIJS77STDtcY"""",
  		"Priority" -> "u=4",
  		"Sec-Fetch-Dest" -> "empty",
  		"Sec-Fetch-Mode" -> "cors",
  		"Sec-Fetch-Site" -> "same-origin",
  		"authorization" -> "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWU3ZWNkOGM4YjEzNzBkNDAwZTJiMTciLCJ1c2VybmFtZSI6InJhaW1hbjEyMyIsImlhdCI6MTc3Njk1ODk5OCwiZXhwIjoxNzc2OTYyNTk4fQ.pJ_PYG4CbR01vLNtekL1N6-v-3qKQLKL2SeZVCynFTk"
  )
  
  private val headers_42 = Map(
  		"Accept" -> "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  		"Priority" -> "u=0, i",
  		"Sec-Fetch-Dest" -> "document",
  		"Sec-Fetch-Mode" -> "navigate",
  		"Sec-Fetch-Site" -> "none",
  		"Sec-Fetch-User" -> "?1",
  		"Upgrade-Insecure-Requests" -> "1"
  )
  
  private val uri2 = "https://www.google.com/complete/search"
  
  private val uri3 = "https://mozilla-ohttp.fastly-edge.com"

  private val scn = scenario("PruebasDeCargaFinales")
    .exec(
      http("request_0")
        .get(uri2 + "?client=firefox&channel=ftr&q="),
      pause(1),
      http("request_1")
        .get(uri2 + "?client=firefox&channel=fen&q=local"),
      pause(1),
      http("request_2")
        .get("/socket.io/?EIO=4&transport=polling&t=nhyxkqj2")
        .headers(headers_2),
      pause(850.milliseconds),
      http("request_3")
        .post("/socket.io/?EIO=4&transport=polling&t=nhzrhylv&sid=_VKfmXxnp8xEzQMKAAAC")
        .headers(headers_3)
        .body(RawFileBody("yovi/pruebasdecargafinales/0003_request.html")),
      http("request_4")
        .get("/socket.io/?EIO=4&transport=polling&t=nhzrkviy&sid=_VKfmXxnp8xEzQMKAAAC")
        .headers(headers_2),
      pause(4),
      http("request_5")
        .post(uri3 + "/")
        .headers(headers_5)
        .body(RawFileBody("yovi/pruebasdecargafinales/0005_request.dat")),
      pause(5),
      http("request_6")
        .post("/api/login")
        .headers(headers_6)
        .body(RawFileBody("yovi/pruebasdecargafinales/0006_request.json")),
      http("request_7")
        .get("/socket.io/?EIO=4&transport=polling&t=nhztho81&sid=_VKfmXxnp8xEzQMKAAAC")
        .headers(headers_2),
      http("request_8")
        .post("/socket.io/?EIO=4&transport=polling&t=nij0zw0a&sid=_VKfmXxnp8xEzQMKAAAC")
        .headers(headers_3)
        .body(RawFileBody("yovi/pruebasdecargafinales/0008_request.html")),
      pause(3),
      http("request_9")
        .post("/api/api/bot/check-winner")
        .headers(headers_9)
        .body(RawFileBody("yovi/pruebasdecargafinales/0009_request.json")),
      http("request_10")
        .post("/api/api/bot/play")
        .headers(headers_10)
        .body(RawFileBody("yovi/pruebasdecargafinales/0010_request.json")),
      http("request_11")
        .post("/api/api/bot/check-winner")
        .headers(headers_10)
        .body(RawFileBody("yovi/pruebasdecargafinales/0011_request.json")),
      pause(768.milliseconds),
      http("request_12")
        .post("/api/api/bot/check-winner")
        .headers(headers_9)
        .body(RawFileBody("yovi/pruebasdecargafinales/0012_request.json")),
      http("request_13")
        .post("/api/api/bot/play")
        .headers(headers_10)
        .body(RawFileBody("yovi/pruebasdecargafinales/0013_request.json")),
      http("request_14")
        .post("/api/api/bot/check-winner")
        .headers(headers_10)
        .body(RawFileBody("yovi/pruebasdecargafinales/0014_request.json")),
      pause(769.milliseconds),
      http("request_15")
        .post("/api/api/bot/check-winner")
        .headers(headers_9)
        .body(RawFileBody("yovi/pruebasdecargafinales/0015_request.json")),
      http("request_16")
        .post("/api/api/bot/play")
        .headers(headers_10)
        .body(RawFileBody("yovi/pruebasdecargafinales/0016_request.json")),
      http("request_17")
        .post("/api/api/bot/check-winner")
        .headers(headers_10)
        .body(RawFileBody("yovi/pruebasdecargafinales/0017_request.json")),
      pause(712.milliseconds),
      http("request_18")
        .post("/api/api/bot/check-winner")
        .headers(headers_9)
        .body(RawFileBody("yovi/pruebasdecargafinales/0018_request.json")),
      http("request_19")
        .post("/api/api/bot/play")
        .headers(headers_10)
        .body(RawFileBody("yovi/pruebasdecargafinales/0019_request.json")),
      http("request_20")
        .post("/api/api/bot/check-winner")
        .headers(headers_10)
        .body(RawFileBody("yovi/pruebasdecargafinales/0020_request.json")),
      pause(529.milliseconds),
      http("request_21")
        .post("/api/api/bot/check-winner")
        .headers(headers_9)
        .body(RawFileBody("yovi/pruebasdecargafinales/0021_request.json")),
      http("request_22")
        .post("/api/matches/")
        .headers(headers_10)
        .body(RawFileBody("yovi/pruebasdecargafinales/0022_request.json")),
      pause(1),
      http("request_23")
        .get("/api/matches/user/69e7ecd8c8b1370d400e2b17?page=1&size=5")
        .headers(headers_23),
      pause(12),
      http("request_24")
        .get("/api/matches/ranking/global")
        .headers(headers_24),
      http("request_25")
        .get("/socket.io/?EIO=4&transport=polling&t=nij107bh&sid=_VKfmXxnp8xEzQMKAAAC")
        .headers(headers_2),
      http("request_26")
        .post("/socket.io/?EIO=4&transport=polling&t=nj304xvq&sid=_VKfmXxnp8xEzQMKAAAC")
        .headers(headers_3)
        .body(RawFileBody("yovi/pruebasdecargafinales/0026_request.html")),
      pause(2),
      http("request_27")
        .get("/api/clans/ranking/global")
        .headers(headers_27),
      pause(6),
      http("request_28")
        .get("/api/clans")
        .headers(headers_28),
      pause(6),
      http("request_29")
        .get("/api/matches/user/69e7ecd8c8b1370d400e2b17?page=1&size=5")
        .headers(headers_29),
      http("request_30")
        .get("/socket.io/?EIO=4&transport=polling&t=nj304v11&sid=_VKfmXxnp8xEzQMKAAAC")
        .headers(headers_2),
      http("request_31")
        .post("/socket.io/?EIO=4&transport=polling&t=njmy2l7b&sid=_VKfmXxnp8xEzQMKAAAC")
        .headers(headers_3)
        .body(RawFileBody("yovi/pruebasdecargafinales/0031_request.html")),
      pause(2),
      http("request_32")
        .post("/api/api/bot/check-winner")
        .headers(headers_9)
        .body(RawFileBody("yovi/pruebasdecargafinales/0032_request.json")),
      pause(636.milliseconds),
      http("request_33")
        .post("/api/api/bot/check-winner")
        .headers(headers_9)
        .body(RawFileBody("yovi/pruebasdecargafinales/0033_request.json")),
      pause(409.milliseconds),
      http("request_34")
        .post("/api/api/bot/check-winner")
        .headers(headers_9)
        .body(RawFileBody("yovi/pruebasdecargafinales/0034_request.json")),
      pause(348.milliseconds),
      http("request_35")
        .post("/api/api/bot/check-winner")
        .headers(headers_9)
        .body(RawFileBody("yovi/pruebasdecargafinales/0035_request.json")),
      pause(394.milliseconds),
      http("request_36")
        .post("/api/api/bot/check-winner")
        .headers(headers_9)
        .body(RawFileBody("yovi/pruebasdecargafinales/0036_request.json")),
      pause(340.milliseconds),
      http("request_37")
        .post("/api/api/bot/check-winner")
        .headers(headers_9)
        .body(RawFileBody("yovi/pruebasdecargafinales/0037_request.json")),
      pause(1),
      http("request_38")
        .post("/api/api/bot/check-winner")
        .headers(headers_9)
        .body(RawFileBody("yovi/pruebasdecargafinales/0038_request.json")),
      pause(1),
      http("request_39")
        .post("/api/api/bot/check-winner")
        .headers(headers_9)
        .body(RawFileBody("yovi/pruebasdecargafinales/0039_request.json")),
      pause(399.milliseconds),
      http("request_40")
        .post("/api/api/bot/check-winner")
        .headers(headers_9)
        .body(RawFileBody("yovi/pruebasdecargafinales/0040_request.json")),
      http("request_41")
        .post("/api/matches/")
        .headers(headers_10)
        .body(RawFileBody("yovi/pruebasdecargafinales/0041_request.json")),
      pause(1),
      http("request_42")
        .get("/game")
        .headers(headers_42),
      http("request_43")
        .post("/socket.io/?EIO=4&transport=polling&t=njucop9j&sid=_VKfmXxnp8xEzQMKAAAC")
        .headers(headers_3)
        .body(RawFileBody("yovi/pruebasdecargafinales/0043_request.json"))
        .check(status.is(400)),
      pause(201.milliseconds),
      http("request_44")
        .get("/socket.io/?EIO=4&transport=polling&t=njukcv2x")
        .headers(headers_2),
      http("request_45")
        .post("/socket.io/?EIO=4&transport=polling&t=njumm3iw&sid=Yk3gtciz3q9of06XAAAE")
        .headers(headers_3)
        .body(RawFileBody("yovi/pruebasdecargafinales/0045_request.html")),
      http("request_46")
        .get("/socket.io/?EIO=4&transport=polling&t=njumopym&sid=Yk3gtciz3q9of06XAAAE")
        .headers(headers_2)
    )

	setUp(scn.inject(rampUsers(50).during(10))).protocols(httpProtocol)
}
