/// <reference lib="deno.ns" />

Deno.serve(async (req) => {
  try {
    const payload = await req.json()

    const {
      user1_email,
      user2_email,
      user1_name,
      user2_name,
      scheduled_at,
      video_url,
    } = payload

    const apiKey = Deno.env.get("RESEND_API_KEY")
    if (!apiKey) {
      return new Response("Missing RESEND_API_KEY", { status: 500 })
    }

    const emailBody = `
      <h2>Your Appointment is Scheduled</h2>
      <p><strong>${user1_name}</strong> and <strong>${user2_name}</strong>,</p>
      <p>Your session is scheduled for:</p>
      <p><strong>${new Date(scheduled_at).toLocaleString()}</strong></p>
      <p>You can join the call using the link below:</p>
      <p><a href="${video_url}">${video_url}</a></p>
      <br/>
      <p>See you there!</p>
    `

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Skill Exchange <noreply@skillexchange.app>",
        to: [user1_email, user2_email],
        subject: "Your Appointment is Scheduled",
        html: emailBody,
      }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), { status: 200 })
  } catch (e) {
    console.error(e)
    return new Response("Error sending email", { status: 500 })
  }
})
