import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Link as LinkIcon,
  Pencil,
  Save,
  Trash2,
  Video,
} from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

EventDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["berulang", "sekali"]).isRequired,
    link_meet: PropTypes.string,
  }),
  onEventUpdate: PropTypes.func.isRequired,
  onEventDelete: PropTypes.func.isRequired,
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export function EventDetailsDialog({
  open,
  onOpenChange,
  event,
  onEventUpdate,
  onEventDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);

  useEffect(() => {
    if (event) {
      setEditedEvent(event);
    }
  }, [event]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "waktu_mulai") {
      setEditedEvent((prev) => ({
        ...prev,
        waktu_mulai: value,
        time: `${value} - ${
          prev?.waktu_selesai || prev?.time?.split(" - ")?.[1] || ""
        }`,
      }));
    } else if (name === "waktu_selesai") {
      setEditedEvent((prev) => ({
        ...prev,
        waktu_selesai: value,
        time: `${
          prev?.waktu_mulai || prev?.time?.split(" - ")?.[0] || ""
        } - ${value}`,
      }));
    } else {
      setEditedEvent((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    const [startTime, endTime] = editedEvent.time?.split(" - ") || [];

    const formattedData = {
      id: editedEvent.id,
      nama_event: editedEvent.title,
      deskripsi: editedEvent.description,
      tanggal: editedEvent.date,
      waktu_mulai: editedEvent.waktu_mulai || startTime?.trim(),
      waktu_selesai:
        editedEvent.waktu_selesai || endTime?.replace(" WIB", "")?.trim(),
      link_meet: editedEvent.link_meet || null,
      berulang: editedEvent.type === "berulang" ? 1 : 0,
    };

    if (
      !formattedData.nama_event ||
      !formattedData.tanggal ||
      !formattedData.waktu_mulai ||
      !formattedData.waktu_selesai
    ) {
      alert("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    onEventUpdate(formattedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedEvent(event);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus event ini?")) {
      onEventDelete(event.id);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <DialogTitle className="text-xl">
                {isEditing ? "Edit Event" : event.title}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? "Edit detail acara" : "Detail acara dan tindakan"}
              </DialogDescription>
            </div>
            <div className="flex gap-2 mr-4">
              {!isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <Badge
            variant={event.type === "berulang" ? "secondary" : "outline"}
            className={cn(
              "rounded-md",
              event.type === "berulang" && "bg-[#E6FFF9] text-emerald-800"
            )}
          >
            {event.type === "berulang" ? "Event Berulang" : "Event Sekali"}
          </Badge>
        </DialogHeader>

        <div className="py-6">
          {isEditing ? (
            <form className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Nama Event</Label>
                <Input
                  id="title"
                  name="title"
                  value={editedEvent.title}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama acara"
                  className="w-full"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      id="date"
                      name="date"
                      value={editedEvent.date}
                      onChange={handleInputChange}
                      className="w-full pl-10"
                    />
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Jenis Event</Label>
                  <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <Label className="text-base">Event Berulang</Label>
                      <p className="text-sm text-muted-foreground">
                        Event akan diulang setiap hari
                      </p>
                    </div>
                    <Switch
                      checked={editedEvent.type === "berulang"}
                      onCheckedChange={(checked) =>
                        setEditedEvent((prev) => ({
                          ...prev,
                          type: checked ? "berulang" : "sekali",
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="waktu_mulai">Waktu Mulai</Label>
                  <div className="relative">
                    <Input
                      type="time"
                      id="waktu_mulai"
                      name="waktu_mulai"
                      value={
                        editedEvent.waktu_mulai ||
                        editedEvent.time?.split(" - ")[0] ||
                        ""
                      }
                      onChange={handleInputChange}
                      className="w-full pl-10"
                    />
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waktu_selesai">Waktu Selesai</Label>
                  <div className="relative">
                    <Input
                      type="time"
                      id="waktu_selesai"
                      name="waktu_selesai"
                      value={
                        editedEvent.waktu_selesai ||
                        editedEvent.time
                          ?.split(" - ")[1]
                          ?.replace(" WIB", "") ||
                        ""
                      }
                      onChange={handleInputChange}
                      className="w-full pl-10"
                    />
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={editedEvent.description}
                  onChange={handleInputChange}
                  placeholder="Tambahkan detail tentang acara"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Link Google Meet</Label>
                <div className="relative">
                  <Input
                    type="url"
                    id="link_meet"
                    name="link_meet"
                    value={editedEvent.link_meet || ""}
                    onChange={handleInputChange}
                    className="w-full pl-10"
                    placeholder="Masukkan link Google Meet"
                  />
                  <Video className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tanggal</p>
                    <p className="font-medium">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Waktu</p>
                    <p className="font-medium">{event.time}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Deskripsi</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {event.link_meet && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium">Link Meeting</h4>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {event.link_meet}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Batal
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Simpan
              </Button>
            </>
          ) : (
            event.link_meet && (
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={() => window.open(event.link_meet, "_blank")}
              >
                <Video className="h-4 w-4" />
                Gabung Google Meet
              </Button>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
