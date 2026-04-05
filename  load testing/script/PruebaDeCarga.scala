package yovi1a

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class PruebaDeCarga extends Simulation {

  private val httpProtocol = http
    .baseUrl("https://localhost")
    .inferHtmlResources(AllowList(), DenyList(""".*\.js""", """.*\.css""", """.*\.gif""", """.*\.jpeg""", """.*\.jpg""", """.*\.ico""", """.*\.woff""", """.*\.woff2""", """.*\.(t|o)tf""", """.*\.png""", """.*\.svg""", """.*detectportal\.firefox\.com.*"""))
    .acceptHeader("*/*")
    .acceptEncodingHeader("gzip, deflate, br")
    .acceptLanguageHeader("es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7")
    .userAgentHeader("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0")
  
  private val headers_0 = Map(
      "Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
      "If-None-Match" -> """"c6925b8574b72bd5ac3c0bb1d9c74fac85743d54"""",
      "Origin" -> "null",
      "Priority" -> "u=5",
      "Sec-Fetch-Dest" -> "image",
      "Sec-Fetch-Mode" -> "cors",
      "Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_1 = Map(
      "Content-Type" -> "message/ohttp-req",
      "Priority" -> "u=4",
      "Sec-Fetch-Dest" -> "empty",
      "Sec-Fetch-Mode" -> "no-cors",
      "Sec-Fetch-Site" -> "none"
  )
  
  private val headers_7 = Map(
      "Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
      "If-Modified-Since" -> "Wed, 01 Apr 2026 19:38:50 GMT",
      "If-None-Match" -> """"ec32cb8b67e883b5749c4323f99f4269"""",
      "Priority" -> "u=5",
      "Sec-Fetch-Dest" -> "image",
      "Sec-Fetch-Mode" -> "no-cors",
      "Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_8 = Map(
      "Priority" -> "u=4",
      "Sec-Fetch-Dest" -> "empty",
      "Sec-Fetch-Mode" -> "no-cors",
      "Sec-Fetch-Site" -> "none",
      "content-type" -> "message/ohttp-req"
  )
  
  private val headers_9 = Map(
      "Content-Type" -> "application/json",
      "Origin" -> "https://localhost",
      "Priority" -> "u=0",
      "Sec-Fetch-Dest" -> "empty",
      "Sec-Fetch-Mode" -> "cors",
      "Sec-Fetch-Site" -> "same-origin"
  )
  
  private val headers_10 = Map(
      "Content-Type" -> "application/json",
      "Priority" -> "u=4",
      "Sec-Fetch-Dest" -> "empty",
      "Sec-Fetch-Mode" -> "cors",
      "Sec-Fetch-Site" -> "same-origin",
      "authorization" -> "Bearer ${authToken}"
  )
  
  private val headers_11 = Map(
      "Content-Type" -> "application/json",
      "Priority" -> "u=0",
      "Sec-Fetch-Dest" -> "empty",
      "Sec-Fetch-Mode" -> "cors",
      "Sec-Fetch-Site" -> "same-origin",
      "authorization" -> "Bearer ${authToken}"
  )
  
  private val headers_14 = Map(
      "Content-Type" -> "application/json",
      "If-None-Match" -> """W/"619-qkO9jrTBJxAa8bV2JofgnWtPzGQ"""",
      "Priority" -> "u=0",
      "Sec-Fetch-Dest" -> "empty",
      "Sec-Fetch-Mode" -> "cors",
      "Sec-Fetch-Site" -> "same-origin",
      "authorization" -> "Bearer ${authToken}"
  )
  
  private val headers_20 = Map("Priority" -> "u=4")
  
  private val headers_21 = Map(
      "Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
      "If-Modified-Since" -> "Fri, 15 Aug 2025 19:57:13 GMT",
      "If-None-Match" -> """"5f69491b35475798458fcc116b982145"""",
      "Priority" -> "u=4, i",
      "Sec-Fetch-Dest" -> "image",
      "Sec-Fetch-Mode" -> "no-cors",
      "Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_22 = Map(
      "Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
      "If-Modified-Since" -> "Fri, 15 Aug 2025 19:55:42 GMT",
      "If-None-Match" -> """"9dfe3edbb20c5ead76c9d25b5eb7cf88"""",
      "Priority" -> "u=4, i",
      "Sec-Fetch-Dest" -> "image",
      "Sec-Fetch-Mode" -> "no-cors",
      "Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_23 = Map(
      "Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
      "Priority" -> "u=4, i",
      "Sec-Fetch-Dest" -> "image",
      "Sec-Fetch-Mode" -> "no-cors",
      "Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_31 = Map(
      "Content-Type" -> "application/json",
      "Origin" -> "https://localhost",
      "Priority" -> "u=0",
      "Sec-Fetch-Dest" -> "empty",
      "Sec-Fetch-Mode" -> "cors",
      "Sec-Fetch-Site" -> "same-origin",
      "authorization" -> "Bearer ${authToken}"
  )
  
  private val headers_32 = Map(
      "Content-Type" -> "application/json",
      "Origin" -> "https://localhost",
      "Priority" -> "u=4",
      "Sec-Fetch-Dest" -> "empty",
      "Sec-Fetch-Mode" -> "cors",
      "Sec-Fetch-Site" -> "same-origin",
      "authorization" -> "Bearer ${authToken}"
  )
  
  private val headers_88 = Map(
      "Content-Type" -> "application/json",
      "If-None-Match" -> """W/"5f2-y/JQMH5v5kxzhDJFiCsasPxDCDs"""",
      "Priority" -> "u=4",
      "Sec-Fetch-Dest" -> "empty",
      "Sec-Fetch-Mode" -> "cors",
      "Sec-Fetch-Site" -> "same-origin",
      "authorization" -> "Bearer ${authToken}"
  )
  
  private val uri1 = "https://ads-img.mozilla.org/v1/images"
  private val uri2 = "https://prod-images.merino.prod.webservices.mozgcp.net/favicons/01fffb5c00852416b3f731f8d42c92f26b8af7fdb2926cb9e8106802f58a0ade_1409.oct"
  private val uri3 = "https://www.google.com/complete/search"
  private val uri4 = "https://mozilla-ohttp.fastly-edge.com"
  private val uri5 = "https://merino.services.mozilla.com/api/v1/suggest"
  private val uri7 = "https://img-getpocket.cdn.mozilla.net/592x320/smart/filters:format(webp):quality(75):no_upscale():strip_exif()/https%3A%2F%2Fads-img.mozilla.org%2Fv1%2Fimages%3Fimage_data%3DCrYBCrMBaHR0cHM6Ly9jcmVhdGl2ZXMuc2FzY2RuLmNvbS9kaWZmLzU0MTQvYWR2ZXJ0aXNlci81MzY4ODAvQ3JlYV90dV9zaXRpb193ZWJfZ3JhdGlzX3lfY29uZWN0YV90dV9kb21pbmlvX3Npbl9jb3N0ZV9hbGd1bm8uX19fX19Tb2xvX05ld19UYWJfXzdjYTcwMTk0LTQ2ODAtNGVhYS1iZTg5LTYxMmYwNWUxMjdiZC5wbmcSIDgzqZgDgnVf01rX3ak2qERznPIn7neuirq95KBPiRjF"

  private val scn = scenario("PruebaDeCarga")
    .exec(
      http("request_0")
        .get(uri7)
        .headers(headers_0)
        .resources(
          http("request_1")
            .post(uri4 + "/")
            .headers(headers_1)
            .body(RawFileBody("yovi1a/pruebadecarga/0001_request.dat")),
          http("request_2")
            .get(uri3 + "?client=firefox&channel=ftr&q=")
        ),
      pause(1),
      http("request_3")
        .get(uri3 + "?client=firefox&channel=fen&q=local"),
      pause(2),
      http("request_7")
        .get(uri2)
        .headers(headers_7)
        .resources(
          http("request_8")
            .post(uri4 + "/")
            .headers(headers_8)
            .body(RawFileBody("yovi1a/pruebadecarga/0008_request.dat"))
        ),
      pause(7),
      http("request_9")
        .post("/api/login")
        .headers(headers_9)
        .body(RawFileBody("yovi1a/pruebadecarga/0009_request.json"))
        .check(jsonPath("$.token").saveAs("authToken")),
      pause(3),
      http("request_10")
        .get("/api/matches/user/69cfd3139236a2336deb7b37?page=1&size=5")
        .headers(headers_10),
      pause(2),
      http("request_11")
        .get("/api/matches/user/69cfd3139236a2336deb7b37?page=2&size=5")
        .headers(headers_11),
      pause(1),
      http("request_12")
        .get("/api/matches/user/69cfd3139236a2336deb7b37?page=3&size=5")
        .headers(headers_11),
      pause(1),
      http("request_13")
        .get("/api/matches/user/69cfd3139236a2336deb7b37?page=3&size=5&maxDuration=-1")
        .headers(headers_11),
      pause(1),
      http("request_14")
        .get("/api/matches/user/69cfd3139236a2336deb7b37?page=3&size=5")
        .headers(headers_14),
      pause(1),
      http("request_15")
        .get("/api/matches/user/69cfd3139236a2336deb7b37?page=3&size=5&maxMoves=1")
        .headers(headers_11)
        .resources(
          http("request_18")
            .get("/api/matches/user/69cfd3139236a2336deb7b37?page=3&size=5")
            .headers(headers_14)
        ),
      pause(5),
      http("request_19")
        .post(uri4 + "/")
        .headers(headers_1)
        .body(RawFileBody("yovi1a/pruebadecarga/0019_request.dat"))
        .resources(
          http("request_20")
            .get(uri5 + "?q=&providers=accuweather&request_type=weather&source=newtab&country=ES&sid=2e0084be-2411-4e8a-9329-648ead2a554a&seq=0")
            .headers(headers_20)
            .check(status.is(400)),
          http("request_21")
            .get(uri1 + "?image_data=CnAKbmh0dHBzOi8vYW1wLWFzc2V0LjQ1dHUxYzAuY29tL2Fzc2V0cy8xNDMxL2UxYjMxOGJkNDkzNDYyN2Q3MjZkNTFmOWM1ZDQyNTVjZWFhNjI0MWRkYmY4M2RmMDE5MGUyMjBiN2E4MWUyODUuanBnEiCF1FoJ1nRR2YvYgV1umBhTKA482BKOK56b6gVGpg0XUQ")
            .headers(headers_21),
          http("request_22")
            .get(uri1 + "?image_data=CnAKbmh0dHBzOi8vYW1wLWFzc2V0LjQ1dHUxYzAuY29tL2Fzc2V0cy8xMDA5L2I2MmM2ZjY0ZWEzY2ExZTFjMmQzMzcwMWZkYmQzMmE0MzllMzRmNDJlZGY5MDQwYTAzNjIwYjg3MDc1NDU1MDguanBnEiCoCsoQw36V5WNmQ0vWqhmhvIgqspGFNqJ3OVrxYFABxg")
            .headers(headers_22),
          http("request_23")
            .get(uri1 + "?image_data=CnAKbmh0dHBzOi8vYW1wLWFzc2V0LjQ1dHUxYzAuY29tL2Fzc2V0cy8xNTA1LzUzNjVhZmUzN2MwYTkyZWVjZTRkMTJiNDA1ZTc5NTRiNzg0MTRkZDU5ZTE1MGYwMDZkMWNhODZmOTkzNzg3Y2IuanBnEiDI-jauPc_OTo0coJi10vmVdZRYQ7mh982FDq4rtBlxXg")
            .headers(headers_23)
        ),
      pause(2),
      http("request_24")
        .get("/api/matches/ranking/global")
        .headers(headers_10),
      pause(5),
      http("request_25")
        .get("/api/clans/ranking/global")
        .headers(headers_10),
      pause(2),
      http("request_26")
        .get("/api/clans")
        .headers(headers_10),
      pause(14),
      http("request_31")
        .post("/api/api/bot/check-winner")
        .headers(headers_31)
        .body(RawFileBody("yovi1a/pruebadecarga/0031_request.json"))
        .resources(
          http("request_32")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0032_request.json")),
          http("request_33")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0033_request.json")),
          http("request_34")
            .post("/api/api/bot/check-winner")
            .headers(headers_31)
            .body(RawFileBody("yovi1a/pruebadecarga/0034_request.json")),
          http("request_35")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0035_request.json")),
          http("request_36")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0036_request.json"))
        ),
      pause(3),
      http("request_37")
        .post("/api/api/bot/check-winner")
        .headers(headers_31)
        .body(RawFileBody("yovi1a/pruebadecarga/0037_request.json"))
        .resources(
          http("request_38")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0038_request.json")),
          http("request_39")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0039_request.json")),
          http("request_40")
            .post("/api/api/bot/check-winner")
            .headers(headers_31)
            .body(RawFileBody("yovi1a/pruebadecarga/0040_request.json")),
          http("request_41")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0041_request.json")),
          http("request_42")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0042_request.json")),
          http("request_43")
            .post("/api/api/bot/check-winner")
            .headers(headers_31)
            .body(RawFileBody("yovi1a/pruebadecarga/0043_request.json")),
          http("request_44")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0044_request.json")),
          http("request_45")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0045_request.json")),
          http("request_46")
            .post("/api/api/bot/check-winner")
            .headers(headers_31)
            .body(RawFileBody("yovi1a/pruebadecarga/0046_request.json")),
          http("request_47")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0047_request.json")),
          http("request_48")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0048_request.json"))
        ),
      pause(1),
      http("request_49")
        .post("/api/api/bot/check-winner")
        .headers(headers_31)
        .body(RawFileBody("yovi1a/pruebadecarga/0049_request.json"))
        .resources(
          http("request_50")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0050_request.json")),
          http("request_51")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0051_request.json"))
        ),
      pause(2),
      http("request_54")
        .post("/api/api/bot/check-winner")
        .headers(headers_31)
        .body(RawFileBody("yovi1a/pruebadecarga/0054_request.json"))
        .resources(
          http("request_55")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0055_request.json")),
          http("request_56")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0056_request.json"))
        ),
      pause(1),
      http("request_57")
        .post("/api/api/bot/check-winner")
        .headers(headers_31)
        .body(RawFileBody("yovi1a/pruebadecarga/0057_request.json"))
        .resources(
          http("request_58")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0058_request.json")),
          http("request_59")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0059_request.json"))
        ),
      pause(1),
      http("request_60")
        .post("/api/api/bot/check-winner")
        .headers(headers_31)
        .body(RawFileBody("yovi1a/pruebadecarga/0060_request.json"))
        .resources(
          http("request_61")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0061_request.json")),
          http("request_62")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0062_request.json"))
        ),
      pause(1),
      http("request_63")
        .post("/api/api/bot/check-winner")
        .headers(headers_31)
        .body(RawFileBody("yovi1a/pruebadecarga/0063_request.json"))
        .resources(
          http("request_64")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0064_request.json")),
          http("request_65")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0065_request.json")),
          http("request_66")
            .post("/api/api/bot/check-winner")
            .headers(headers_31)
            .body(RawFileBody("yovi1a/pruebadecarga/0066_request.json")),
          http("request_67")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0067_request.json")),
          http("request_68")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0068_request.json")),
          http("request_69")
            .post("/api/api/bot/check-winner")
            .headers(headers_31)
            .body(RawFileBody("yovi1a/pruebadecarga/0069_request.json")),
          http("request_70")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0070_request.json")),
          http("request_71")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0071_request.json")),
          http("request_72")
            .post("/api/api/bot/check-winner")
            .headers(headers_31)
            .body(RawFileBody("yovi1a/pruebadecarga/0072_request.json")),
          http("request_73")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0073_request.json")),
          http("request_74")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0074_request.json"))
        ),
      pause(2),
      http("request_75")
        .post("/api/api/bot/check-winner")
        .headers(headers_31)
        .body(RawFileBody("yovi1a/pruebadecarga/0075_request.json"))
        .resources(
          http("request_76")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0076_request.json")),
          http("request_77")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0077_request.json"))
        ),
      pause(3),
      http("request_78")
        .post("/api/api/bot/check-winner")
        .headers(headers_31)
        .body(RawFileBody("yovi1a/pruebadecarga/0078_request.json"))
        .resources(
          http("request_79")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0079_request.json")),
          http("request_80")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0080_request.json")),
          http("request_81")
            .post("/api/api/bot/check-winner")
            .headers(headers_31)
            .body(RawFileBody("yovi1a/pruebadecarga/0081_request.json")),
          http("request_82")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0082_request.json")),
          http("request_83")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0083_request.json")),
          http("request_84")
            .post("/api/api/bot/check-winner")
            .headers(headers_31)
            .body(RawFileBody("yovi1a/pruebadecarga/0084_request.json")),
          http("request_85")
            .post("/api/api/bot/play")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0085_request.json")),
          http("request_86")
            .post("/api/api/bot/check-winner")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0086_request.json")),
          http("request_87")
            .post("/api/matches/")
            .headers(headers_32)
            .body(RawFileBody("yovi1a/pruebadecarga/0087_request.json"))
        ),
      pause(2),
      http("request_88")
        .get("/api/matches/user/69cfd3139236a2336deb7b37?page=1&size=5")
        .headers(headers_88)
    )

  setUp(scn.inject(rampUsers(50).during(10))).protocols(httpProtocol)
}