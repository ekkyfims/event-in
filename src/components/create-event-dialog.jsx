import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Video } from "lucide-react";
import PropTypes from "prop-types";
import { useState } from "react";

export function CreateEventDialog({ open, onOpenChange, onCreateEvent }) {
  const [isRecurring, setIsRecurring] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    meetLink: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !formData.startTime || !formData.endTime || !formData.name) {
      return;
    }

    const newEvent = {
      title: formData.name,
      description: formData.description,
      date: format(date, "yyyy-MM-dd"),
      time: `${formData.startTime} - ${formData.endTime} WIB`,
      link_meet: formData.meetLink,
      type: isRecurring ? "berulang" : "sekali",
    };

    try {
      await onCreateEvent(newEvent);
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
        startTime: "",
        endTime: "",
        meetLink: "",
      });
      setDate(null);
      setIsRecurring(false);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">Buat Event Baru</DialogTitle>
          <DialogDescription>
            Isi detail untuk acara baru Anda. Klik simpan setelah selesai.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Event</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Masukkan nama acara"
              className="w-full"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col w-full space-y-2">
              <Label>Tanggal</Label>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    {date ? (
                      format(date, "PPP", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="flex w-auto flex-col space-y-2 p-2"
                  align="start"
                >
                  <Select
                    onValueChange={(value) =>
                      setDate(addDays(new Date(), parseInt(value)))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="0">Hari Ini</SelectItem>
                      <SelectItem value="1">Besok</SelectItem>
                      <SelectItem value="3">3 Hari Lagi</SelectItem>
                      <SelectItem value="7">Seminggu Lagi</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="rounded-md border">
                    <Calendar
                      locale={id}
                      mode="single"
                      captionLayout="dropdown"
                      selected={date}
                      onSelect={(selectedDate) => {
                        setDate(selectedDate);
                        setIsOpen(false);
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
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
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">Waktu Mulai</Label>
              <div className="relative">
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full pl-10"
                />
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Waktu Selesai</Label>
              <div className="relative">
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
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
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Tambahkan detail tentang acara"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Link Google Meet</Label>
            <div className="relative">
              <Input
                id="meetLink"
                value={formData.meetLink}
                onChange={handleInputChange}
                placeholder="Masukkan link Google Meet"
                className="w-full pl-10"
              />
              <Video className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" size="lg" className="w-full">
              Buat Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

CreateEventDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onCreateEvent: PropTypes.func.isRequired,
};
