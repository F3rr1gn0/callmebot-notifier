# Home Assistant

REST command:

```yaml
rest_command:
  callmebot_notify:
    url: "http://your-host:3000/notify"
    method: POST
    content_type: "application/json"
    payload: '{"message":"Home Assistant alert"}'
```

Automation:

```yaml
automation:
  - alias: Notify CallMeBot
    trigger:
      - platform: state
        entity_id: binary_sensor.door
        to: "on"
    action:
      - service: rest_command.callmebot_notify
```
